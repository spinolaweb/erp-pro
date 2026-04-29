export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatNumber = (number) => {
  if (number === undefined || number === null) return '0';
  return new Intl.NumberFormat('en-US').format(number);
};
