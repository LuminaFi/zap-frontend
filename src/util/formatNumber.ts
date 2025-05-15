// Format a number with commas (1000 -> 1,000)
export const formatNumber = (value: string | number): string => {
  if (!value) return '0';
  
  const numValue = typeof value === 'string' ? value.replace(/[^\d]/g, '') : String(value);
  
  if (numValue === '') return '0';
  
  return new Intl.NumberFormat('en-US').format(parseInt(numValue, 10));
};

// Format a number with K, M, B abbreviations (1000 -> 1K, 1000000 -> 1M, etc.)
export const formatAbbreviatedNumber = (num: number | string): string => {
  if (!num) return '0';
  
  const number = typeof num === 'string' ? parseFloat(num.replace(/[^\d.-]/g, '')) : num;
  
  if (isNaN(number)) return '0';
  
  // Billions
  if (Math.abs(number) >= 1_000_000_000) {
    return (number / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  }
  
  // Millions
  if (Math.abs(number) >= 1_000_000) {
    return (number / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  
  // Thousands
  if (Math.abs(number) >= 1_000) {
    return (number / 1_000).toFixed(2).replace(/\.00$/, '') + 'K';
  }
  
  return number.toString();
}; 