// Format a number with commas (1000 -> 1,000)
export const formatNumber = (value: string | number): string => {
  if (!value) return '0';
  
  const numValue = typeof value === 'string' ? value.replace(/[^\d]/g, '') : String(value);
  
  if (numValue === '') return '0';
  
  return new Intl.NumberFormat('en-US').format(parseInt(numValue, 10));
};

export const formatAbbreviatedNumber = (numStr: string): string => {
  if (!numStr) return 'Rp0';

  // Remove all characters except digits and decimal point
  const cleanedStr = numStr.replace(/[^\d.]/g, '');
  const parts = cleanedStr.split('.');
  const integerPart = parts[0];

  // If number is 20 digits or more, use abbreviated format
  if (integerPart.length >= 20) {
    const firstDigits = integerPart.substring(0, 4);
    const formatted = `${firstDigits.substring(0, 2)}.${firstDigits.substring(2, 4)}`;

    if (integerPart.length >= 30) return `Rp${formatted} Quint.`;
    if (integerPart.length >= 27) return `Rp${formatted} Quad.`;
    if (integerPart.length >= 24) return `Rp${formatted} Tril.`;
    if (integerPart.length >= 21) return `Rp${formatted} Bil.`;

    return `Rp${formatted} Mil.`;
  }

  // Parse as float to preserve decimal values
  const number = parseFloat(cleanedStr);

  // If the number is very small but not zero, show it with decimal places
  if (number > 0 && number < 1) {
    return `Rp${number.toFixed(4)}`;
  }

  // For zero values, explicitly check to avoid displaying Rp0 for small non-zero values
  if (number === 0) {
    return 'Rp0';
  }

  // For regular numbers, use locale formatting
  return number.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  });
};