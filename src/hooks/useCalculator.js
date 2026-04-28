import { useState, useMemo } from 'react';
import { calculateCOD } from '../utils/calculator';

export function useCalculator(initialValues = {}, exchangeRate = 250) {
  const [values, setValues] = useState({
    orders: 0,
    confirmation_rate: 70,
    delivery_rate: 70,
    ad_spend_usd: 0,
    clicks: 0,
    selling_price_dzd: 4900,
    product_cost_dzd: 3400,
    ...initialValues
  });

  const updateValue = (field, value) => {
    setValues(prev => {
      const next = { ...prev, [field]: Number(value) || 0 };
      if (field === 'orders' || field === 'ad_spend_usd') {
        next.cpr_usd = next.orders > 0 ? next.ad_spend_usd / next.orders : 0;
      }
      return next;
    });
  };

  const metrics = useMemo(() => calculateCOD(values, exchangeRate), [values, exchangeRate]);

  return { values, updateValue, metrics, setValues };
}
