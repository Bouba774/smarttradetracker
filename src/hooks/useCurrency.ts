import { useSettings } from './useSettings';
import { useCallback } from 'react';

export const useCurrency = () => {
  const { settings } = useSettings();
  const currency = settings.currency || 'USD';

  const formatAmount = useCallback((amount: number | null | undefined, showSign = false): string => {
    if (amount === null || amount === undefined) return '-';
    
    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));

    if (showSign && amount !== 0) {
      return amount > 0 ? `+${formatted}` : `-${formatted}`;
    }
    
    return amount < 0 ? `-${formatted}` : formatted;
  }, [currency]);

  const formatAmountShort = useCallback((amount: number | null | undefined, showSign = false): string => {
    if (amount === null || amount === undefined) return '-';
    
    const absAmount = Math.abs(amount);
    let formatted: string;

    if (absAmount >= 1000000) {
      formatted = `${(absAmount / 1000000).toFixed(1)}M ${currency}`;
    } else if (absAmount >= 1000) {
      formatted = `${(absAmount / 1000).toFixed(1)}K ${currency}`;
    } else {
      formatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(absAmount);
    }

    if (showSign && amount !== 0) {
      return amount > 0 ? `+${formatted}` : `-${formatted}`;
    }
    
    return amount < 0 ? `-${formatted}` : formatted;
  }, [currency]);

  const getCurrencySymbol = useCallback((): string => {
    try {
      const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol',
      });
      const parts = formatter.formatToParts(0);
      const symbolPart = parts.find(p => p.type === 'currency');
      return symbolPart?.value || currency;
    } catch {
      return currency;
    }
  }, [currency]);

  return {
    currency,
    formatAmount,
    formatAmountShort,
    getCurrencySymbol,
  };
};

export default useCurrency;
