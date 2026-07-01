export const formatCurrency = (amount: number, currency?: 'INR' | 'USD' | 'GBP'): string => {
  const activeCurrency = currency || 'INR';
  const symbols = {
    INR: '₹',
    USD: '$',
    GBP: '£'
  };
  
  // Format numbers nicely based on local formats
  if (activeCurrency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  const sym = symbols[activeCurrency] || '₹';
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
