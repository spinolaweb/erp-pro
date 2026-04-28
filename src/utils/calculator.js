cat > src/utils/calculator.js << 'EOF'
export function calculateCOD(entry, exchangeRate = 250) {
  const orders = Number(entry.orders) || 0;
  const confirmationRate = Number(entry.confirmation_rate) || 0;
  const deliveryRate = Number(entry.delivery_rate) || 0;
  const adSpendUSD = Number(entry.ad_spend_usd) || 0;
  const clicks = Number(entry.clicks) || 0;
  const sellingPriceDZD = Number(entry.selling_price_dzd) || 0;
  const productCostDZD = Number(entry.product_cost_dzd) || 0;

  const confirmed = orders * (confirmationRate / 100);
  const delivered = confirmed * (deliveryRate / 100);
  
  const revenueDZD = delivered * sellingPriceDZD;
  const productCostDeliveredDZD = delivered * productCostDZD;
  const adSpendDZD = adSpendUSD * exchangeRate;
  
  const profitDZD = revenueDZD - productCostDeliveredDZD - adSpendDZD;
  const profitUSD = profitDZD / exchangeRate;
  
  const profitPerUnitDZD = delivered > 0 ? profitDZD / delivered : 0;
  const profitPerUnitUSD = profitPerUnitDZD / exchangeRate;
  
  const cprUSD = orders > 0 ? adSpendUSD / orders : 0;
  const cprCapDZD = sellingPriceDZD - productCostDZD;
  const cprCapUSD = cprCapDZD / exchangeRate;
  const breakEvenROAS = cprCapDZD > 0 ? sellingPriceDZD / cprCapDZD : 0;
  const costPerDeliveredUSD = delivered > 0 ? adSpendUSD / delivered : 0;
  const roas = adSpendDZD > 0 ? revenueDZD / adSpendDZD : 0;
  const rpc = clicks > 0 ? revenueDZD / clicks : 0;
  const cpc = clicks > 0 ? adSpendUSD / clicks : 0;
  const effectiveDeliveryRate = orders > 0 ? (delivered / orders) * 100 : 0;

  return {
    commandes: orders,
    confirmees: confirmed,
    livrees: delivered,
    revenu_dzd: revenueDZD,
    revenu_usd: revenueDZD / exchangeRate,
    cout_produit_dzd: productCostDeliveredDZD,
    cout_produit_usd: productCostDeliveredDZD / exchangeRate,
    depenses_pub_usd: adSpendUSD,
    depenses_pub_dzd: adSpendDZD,
    profit_net_dzd: profitDZD,
    profit_net_usd: profitUSD,
    profit_unite_dzd: profitPerUnitDZD,
    profit_unite_usd: profitPerUnitUSD,
    cpr_usd: cprUSD,
    cpr_cap_dzd: cprCapDZD,
    cpr_cap_usd: cprCapUSD,
    break_even_roas: breakEvenROAS,
    cout_par_livree_usd: costPerDeliveredUSD,
    roas,
    rpc,
    cpc,
    taux_livraison_effectif: effectiveDeliveryRate,
    clicks
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
EOF
