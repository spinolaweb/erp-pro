import { formatCurrency, formatNumber } from '../utils/calculator';

export function KPICard({ title, value, subtitle, type = 'neutral', prefix = '', suffix = '', isCurrency = false, currency = 'DZD' }) {
  const colors = {
    profit: 'bg-emerald-50 border-emerald-200',
    loss: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    neutral: 'bg-white border-gray-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    profit: 'text-emerald-700',
    loss: 'text-red-700',
    warning: 'text-amber-700',
    neutral: 'text-gray-900',
    info: 'text-blue-700'
  };

  const displayValue = isCurrency 
    ? formatCurrency(value, currency)
    : `${prefix}${formatNumber(value)}${suffix}`;

  return (
    <div className={`card ${colors[type]} border`}>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className={`text-2xl font-bold tabular-nums ${textColors[type]}`}>{displayValue}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
