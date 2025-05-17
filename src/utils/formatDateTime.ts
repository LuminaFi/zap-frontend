export const formatDateTime = (dateString?: string | number) => {
  if (!dateString) return '';

  try {

    const date = typeof dateString === 'number'
      ? new Date(dateString * 1000)
      : /^\d+$/.test(String(dateString))
        ? new Date(Number(dateString) * 1000)
        : new Date(dateString);


    if (isNaN(date.getTime())) {
      return String(dateString);
    }


    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return String(dateString);
  }
};