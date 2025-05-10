export const formatNumber = (value: string) => {
  // Remove any non-digit characters
  const numericValue = value.replace(/[^\d]/g, '');
  
  // Format with commas
  if (numericValue === '') return '';
  
  // Parse as integer and format with commas
  return new Intl.NumberFormat('en-US').format(parseInt(numericValue));
}; 