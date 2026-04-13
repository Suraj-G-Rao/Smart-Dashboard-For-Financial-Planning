// Consistent number formatting to avoid hydration errors

/**
 * Format currency in Indian Rupee format (consistent across server/client)
 * Example: 123456.78 -> ₹1,23,456.78
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Split into integer and decimal parts
  const parts = absAmount.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Indian number system: last 3 digits, then groups of 2
  let formatted = '';
  if (integerPart.length <= 3) {
    formatted = integerPart;
  } else {
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    
    // Add commas every 2 digits from right for remaining
    const groups: string[] = [];
    for (let i = remaining.length; i > 0; i -= 2) {
      groups.unshift(remaining.slice(Math.max(0, i - 2), i));
    }
    
    formatted = groups.join(',') + ',' + lastThree;
  }
  
  // Add decimal part if non-zero
  const result = decimalPart !== '00' ? `${formatted}.${decimalPart}` : formatted;
  
  return `${isNegative ? '-' : ''}₹${result}`;
}

/**
 * Format number without locale to avoid hydration issues
 */
export function formatNumber(num: number, decimals: number = 0): string {
  if (isNaN(num)) return '0';
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
