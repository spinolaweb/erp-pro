export function calculateCOD(entry, exchangeRate = 250) {
  const orders = Number(entry.orders) || 0;
  const confirmationRate = (Number(entry.confirmation_rate) || 0) / 100;
  const deliveryRate = (Number(entry.delivery_rate) || 0) / 100;
  const adSpendUSD = Number(entry.ad_spend_usd) || 0;
  const clicks = Number(entry.clicks) || 0;
  
  const sellingPriceDZD = Number(entry.selling_price_dzd) || 0;
  const productCostDZD = Number(entry.product_cost_dzd) || 0;
  const serviceCostDZD = Number(entry.service_cost_dzd) || 0;
  const stockCampagne = Number(entry.stock_campagne) || 0;

  const confirmed = orders * confirmationRate;
  const delivered = confirmed * deliveryRate;
  const effectiveRate = confirmationRate * deliveryRate * 100;

  const revenueDZD = delivered * sellingPriceDZD;
  const productCostDeliveredDZD = delivered * productCostDZD;
  const adSpendDZD = adSpendUSD * exchangeRate;

  const cadRealDZD = delivered > 0 ? adSpendDZD / delivered : 0; 
  const cservRealDZD = deliveryRate > 0 ? serviceCostDZD / deliveryRate : 0;

  const profitPerUnitDZD = sellingPriceDZD - productCostDZD - cadRealDZD - cservRealDZD;
  const profitDZD = delivered * profitPerUnitDZD;

  const marginPerDeliveryDZD = sellingPriceDZD - productCostDZD - cservRealDZD;
  const cprCapDZD = marginPerDeliveryDZD * (confirmationRate * deliveryRate);
  const cprCapUSD = cprCapDZD / exchangeRate;

  const totalStockInvestment = stockCampagne * productCostDZD;
  const cashFlowPerDelivery = sellingPriceDZD - cadRealDZD - cservRealDZD; 
  let bepUnits = 0;
  if (cashFlowPerDelivery > 0 && totalStockInvestment > 0) {
    bepUnits = Math.ceil(totalStockInvestment / cashFlowPerDelivery);
  }

  const roas = adSpendDZD > 0 ? revenueDZD / adSpendDZD : 0;
  const breakEvenROAS = marginPerDeliveryDZD > 0 ? sellingPriceDZD / marginPerDeliveryDZD : 0;
  const cprUSD = orders > 0 ? adSpendUSD / orders : 0;
  const cpc = clicks > 0 ? adSpendUSD / clicks : 0;

  return {
    commandes: orders,
    confirmees: confirmed,
    livrees: delivered,
    taux_effectif: effectiveRate,
    revenu_dzd: revenueDZD,
    cout_produit_dzd: productCostDeliveredDZD,
    depenses_pub_usd: adSpendUSD,
    depenses_pub_dzd: adSpendDZD,
    profit_net_dzd: profitDZD,
    profit_unite_dzd: profitPerUnitDZD,
    cpr_usd: cprUSD,
    cpr_cap_dzd: cprCapDZD,
    cpr_cap_usd: cprCapUSD,
    roas: roas,
    break_even_roas: breakEvenROAS,
    bep_units: bepUnits,
    cpc: cpc,
    stock_campagne: stockCampagne
  };
}

export function formatNumber(num, decimals = 2) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num || 0);
}

export function formatCurrency(num, currency = 'DZD') {
  const symbol = currency === 'USD' ? '$' : 'DZD';
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0);
  return currency === 'USD' ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
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
  return (totalInventoryCostDZD + totalAdSpendDZD) / marginPerUnitDZD;
}
export function calculateBreakEvenProgress(totalDelivered, breakEvenUnits) {
  if (breakEvenUnits <= 0 || !isFinite(breakEvenUnits)) return 0;
  return Math.min(100, (totalDelivered / breakEvenUnits) * 100);
}
