import { useDayjs } from '#dayjs'

/**
 * Time utilities for Argentina timezone (UTC-3)
 * Handles current time calculations and booking business rules
 */

// Business rule constants
export const ARGENTINA_TIMEZONE_OFFSET = -3 // UTC-3
export const MINIMUM_ADVANCE_HOURS = 4 // Minimum hours in advance to book
export const BUSINESS_HOURS_START = 6 // 6 AM
export const BUSINESS_HOURS_END = 22 // 10 PM

/**
 * Get current time in Argentina (UTC-3)
 * @returns Dayjs object representing current Argentina time
 */
export function getCurrentArgentinaTime() {
  const dayjs = useDayjs()
  // Get current UTC time and adjust for Argentina timezone (UTC-3)
  return dayjs().utcOffset(ARGENTINA_TIMEZONE_OFFSET)
}

/**
 * Check if a given date string is today in Argentina timezone
 * @param dateString - Date in YYYY-MM-DD format
 * @returns true if the date is today
 */
export function isToday(dateString: string): boolean {
  const dayjs = useDayjs()
  const argentinaToday = getCurrentArgentinaTime().format('YYYY-MM-DD')
  return dateString === argentinaToday
}

/**
 * Get the minimum bookable hour for today considering advance booking requirement
 * For future dates, returns null (no restriction)
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Minimum hour (0-23) or null if no restriction
 */
export function getMinimumBookableHour(dateString: string): number | null {
  if (!isToday(dateString)) {
    return null // No restriction for future dates
  }

  const now = getCurrentArgentinaTime()
  const currentHour = now.hour()

  // Add minimum advance hours
  const minimumHour = currentHour + MINIMUM_ADVANCE_HOURS

  return minimumHour
}

/**
 * Check if a time slot hour is available based on current time and business rules
 * Combines: past hour check + minimum advance check
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @param hour - Hour to check (6-22)
 * @returns true if the hour is available for booking
 */
export function isHourAvailableForBooking(dateString: string, hour: number): boolean {
  // For future dates, all hours are available (only service duration matters)
  if (!isToday(dateString)) {
    return true
  }

  // For today, check minimum bookable hour
  const minimumHour = getMinimumBookableHour(dateString)

  if (minimumHour === null) {
    return true
  }

  return hour >= minimumHour
}

/**
 * Filter hours array based on time constraints (past hours + minimum advance)
 * This does NOT include service duration validation - that's handled separately
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @param hours - Array of hours to filter
 * @returns Filtered array of available hours
 */
export function filterHoursByTimeConstraints(dateString: string, hours: number[]): number[] {
  return hours.filter(hour => isHourAvailableForBooking(dateString, hour))
}
