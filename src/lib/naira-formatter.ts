
export function formatNaira(amount: number, includeDecimals: boolean = false): string {
  if (isNaN(amount)) return '₦0'
  
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  })
  
  return formatter.format(amount)
}

export function formatUSD(amount: number, includeDecimals: boolean = false): string {
  if (isNaN(amount)) return '$0'
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeDecimals ? 0 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  })
  
  return formatter.format(amount)
}

export function formatNairaShort(amount: number): string {
  if (amount >= 1000000000) {
    return `₦${(amount / 1000000000).toFixed(1)}B`
  }
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(0)}K`
  }
  return `₦${amount}`
}

// Common Nigerian price ranges
export const PRICE_RANGES = [
  { label: 'Under ₦1M', min: 0, max: 1000000 },
  { label: '₦1M - ₦5M', min: 1000000, max: 5000000 },
  { label: '₦5M - ₦10M', min: 5000000, max: 10000000 },
  { label: '₦10M - ₦50M', min: 10000000, max: 50000000 },
  { label: '₦50M - ₦100M', min: 50000000, max: 100000000 },
  { label: '₦100M - ₦500M', min: 100000000, max: 500000000 },
  { label: 'Over ₦500M', min: 500000000, max: 10000000000 },
]

// Rent periods
export const RENT_PERIODS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'quarterly', label: 'Quarterly (3 months)' },
]
