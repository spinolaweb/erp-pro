export function calculateCOD(entry, exchangeRate = 250) {
  const orders = Number(entry.orders) || 0;
  const confirmationRate = Number(entry.confirmation_rate) || 0;
  const deliveryRate = Number(entry.delivery_rate) || 0;
  const adSpendUSD = Number(entry.ad_spend_usd) || 0;
  const clicks = Number(entry.clicks) || 0;
  const sellingPriceDZD = Number(entry.selling_price_dzd) || 0;
  const productCostDZD = Number(entry.product_cost_dzd) || 0;
  const campaignQuantity = Number(entry.campaign_quantity) || 0;

  const confirmed = orders * (confirmationRate / 100);
  const delivered = confirmed * (deliveryRate / 100);
  
  const revenueDZD = delivered * sellingPriceDZD;
  const adSpendDZD = adSpendUSD * exchangeRate;
  
  // Standard Profit (Only delivered items)
  const productCostDeliveredDZD = delivered * productCostDZD;
  const standardProfitDZD = revenueDZD - productCostDeliveredDZD - adSpendDZD;
  
  // TRUE Profit (Factors in the total unsold stock allocated to this campaign)
  const baseQuantity = campaignQuantity > 0 ? campaignQuantity : delivered;
  const totalInventoryCostDZD = baseQuantity * productCostDZD;
  const trueTotalCostDZD = totalInventoryCostDZD + adSpendDZD;
  const trueProfitDZD = revenueDZD - trueTotalCostDZD;
  const trueProfitUSD = trueProfitDZD / exchangeRate;
  
  // Break-Even Calculations
  const breakEvenPiecesDelivered = sellingPriceDZD > 0 ? trueTotalCostDZD / sellingPriceDZD : 0;
  const deliveryProbability = (confirmationRate / 100) * (deliveryRate / 100);
  const breakEvenOrdersNeeded = deliveryProbability > 0 ? breakEvenPiecesDelivered / deliveryProbability : 0;
  
  // Marginal Profit (Profit for every piece sold AFTER break-even)
  // Since the product cost is fully accounted for in the trueTotalCost, every new sale yields the full selling price
  const marginalProfitDZD = sellingPriceDZD;

  const cprUSD = orders > 0 ? adSpendUSD / orders : 0;
  const breakEvenROAS = (sellingPriceDZD - productCostDZD) > 0 ? sellingPriceDZD / (sellingPriceDZD - productCostDZD) : 0;
  const roas = adSpendDZD > 0 ? revenueDZD / adSpendDZD : 0;

  return {
    commandes: orders,
    confirmees: confirmed,
    livrees: delivered,
    revenu_dzd: revenueDZD,
    revenu_usd: revenueDZD / exchangeRate,
    cout_produit_dzd: productCostDeliveredDZD,
    depenses_pub_usd: adSpendUSD,
    depenses_pub_dzd: adSpendDZD,
    profit_net_dzd: standardProfitDZD, // Standard for legacy charts
    
    // NEW TRUE PROFIT METRICS
    campaign_quantity: campaignQuantity,
    true_profit_dzd: trueProfitDZD,
    true_profit_usd: trueProfitUSD,
    break_even_pieces: breakEvenPiecesDelivered,
    break_even_orders: breakEvenOrdersNeeded,
    marginal_profit_dzd: marginalProfitDZD,
    
    cpr_usd: cprUSD,
    break_even_roas: breakEvenROAS,
    roas,
    taux_livraison_effectif: orders > 0 ? (delivered / orders) * 100 : 0
  };
}

export function formatNumber(num, decimals = 2) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

export function formatCurrency(num, currency = 'DZD') {
  const symbol = currency === 'USD' ? '$' : 'DZD';
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
  return currency === 'USD' ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
}

// ======================
// RESTORED INVENTORY & BREAK-EVEN
// ======================

export function calculateDelivered(orders, confirmationRate, deliveryRate) {
  return orders * (confirmationRate / 100) * (deliveryRate / 100);
}

export function calculateAccountingBreakEven(adSpendUSD, sellingPriceDZD, productCostDZD, exchangeRate) {
  const marginPerUnitDZD = sellingPriceDZD - productCostDZD;
  const marginPerUnitUSD = marginPerUnitDZD / exchangeRate;
  if (marginPerUnitUSD <= 0) return Infinity;
  return adSpendUSD / marginPerUnitUSD;
}

export function calculateInvestmentBreakEven(totalInventoryCostDZD, totalAdSpendUSD, sellingPriceDZD, productCostDZD, exchangeRate) {
  const marginPerUnitDZD = sellingPriceDZD - productCostDZD;
  if (marginPerUnitDZD <= 0) return Infinity;
  const totalAdSpendDZD = totalAdSpendUSD * exchangeRate;
  const totalInvestment = totalInventoryCostDZD + totalAdSpendDZD;
  return totalInvestment / marginPerUnitDZD;
}

export function calculateInventoryValue(remainingStock, costPriceDZD) {
  return remainingStock * costPriceDZD;
}

export function calculateBreakEvenProgress(totalDelivered, breakEvenUnits) {
  if (breakEvenUnits <= 0 || !isFinite(breakEvenUnits)) return 0;
  return Math.min(100, (totalDelivered / breakEvenUnits) * 100);
}
