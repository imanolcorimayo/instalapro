/**
 * Timezone utilities for InstalaPro Back Office
 * Configured for Argentina/Buenos Aires timezone
 */

export const TIMEZONE = 'America/Buenos_Aires'

/**
 * Get current date/time in Buenos Aires timezone
 */
export function nowInBuenosAires() {
  const { $dayjs } = useNuxtApp()
  return $dayjs().tz(TIMEZONE)
}

/**
 * Convert any date to Buenos Aires timezone
 */
export function toBuenosAires(date) {
  const { $dayjs } = useNuxtApp()
  return $dayjs(date).tz(TIMEZONE)
}

/**
 * Format date in Buenos Aires timezone
 */
export function formatInBuenosAires(date, format = 'YYYY-MM-DD HH:mm') {
  return toBuenosAires(date).format(format)
}

/**
 * Get start of day in Buenos Aires timezone
 */
export function startOfDayInBuenosAires(date) {
  const targetDate = date ? toBuenosAires(date) : nowInBuenosAires()
  return targetDate.startOf('day')
}

/**
 * Get end of day in Buenos Aires timezone
 */
export function endOfDayInBuenosAires(date) {
  const targetDate = date ? toBuenosAires(date) : nowInBuenosAires()
  return targetDate.endOf('day')
}

/**
 * Get start of week in Buenos Aires timezone (Monday as first day)
 */
export function startOfWeekInBuenosAires(date) {
  const targetDate = date ? toBuenosAires(date) : nowInBuenosAires()
  const dayOfWeek = targetDate.day() // 0 = Sunday, 1 = Monday, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // If Sunday (0), go back 6 days, otherwise go back (dayOfWeek - 1) days
  return targetDate.subtract(daysToSubtract, 'day').startOf('day')
}

/**
 * Get end of week in Buenos Aires timezone (Sunday as last day)
 */
export function endOfWeekInBuenosAires(date) {
  const startOfWeek = startOfWeekInBuenosAires(date)
  return startOfWeek.add(6, 'day').endOf('day')
}

/**
 * Get start of month in Buenos Aires timezone
 */
export function startOfMonthInBuenosAires(date) {
  const targetDate = date ? toBuenosAires(date) : nowInBuenosAires()
  return targetDate.startOf('month')
}

/**
 * Get end of month in Buenos Aires timezone
 */
export function endOfMonthInBuenosAires(date) {
  const targetDate = date ? toBuenosAires(date) : nowInBuenosAires()
  return targetDate.endOf('month')
}

/**
 * Check if a date is today in Buenos Aires timezone
 */
export function isTodayInBuenosAires(date) {
  const today = nowInBuenosAires()
  let targetDate
  
  if (typeof date === 'string') {
    // If it's a date string like "2025-08-05", parse it correctly
    targetDate = toBuenosAires(date + 'T00:00:00')
  } else {
    targetDate = toBuenosAires(date)
  }
  
  return today.isSame(targetDate, 'day')
}

/**
 * Check if a date is in the current week in Buenos Aires timezone
 */
export function isThisWeekInBuenosAires(date) {
  const thisWeek = nowInBuenosAires()
  const targetDate = toBuenosAires(date)
  return thisWeek.isSame(targetDate, 'week')
}

/**
 * Check if a date is in the current month in Buenos Aires timezone
 */
export function isThisMonthInBuenosAires(date) {
  const thisMonth = nowInBuenosAires()
  const targetDate = toBuenosAires(date)
  return thisMonth.isSame(targetDate, 'month')
}

/**
 * Parse time string (HH:mm) and create date in Buenos Aires timezone
 */
export function parseTimeInBuenosAires(timeString, baseDate) {
  const base = baseDate ? toBuenosAires(baseDate) : nowInBuenosAires()
  const [hours, minutes] = timeString.split(':').map(Number)
  return base.hour(hours).minute(minutes).second(0).millisecond(0)
}

/**
 * Get business hours time slots for Buenos Aires timezone
 */
export function getBusinessHoursInBuenosAires(date) {
  const targetDate = date ? toBuenosAires(date) : nowInBuenosAires()
  const startOfDay = targetDate.hour(8).minute(0).second(0) // 8:00 AM
  const endOfDay = targetDate.hour(18).minute(0).second(0) // 6:00 PM
  
  const slots = []
  let current = startOfDay
  
  while (current.isBefore(endOfDay)) {
    slots.push(current.format('HH:mm'))
    current = current.add(30, 'minute') // 30-minute intervals
  }
  
  return slots
}