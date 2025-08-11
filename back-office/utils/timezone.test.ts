/**
 * Simple test file to verify timezone functionality
 * This file can be used for manual testing during development
 */

// This is a development test file - not for production
export function testTimezoneImplementation() {
  console.log('=== InstalarPro Timezone Test ===')
  
  try {
    // Test current time in Buenos Aires
    const now = nowInBuenosAires()
    console.log('Current time in Buenos Aires:', now.format('YYYY-MM-DD HH:mm:ss Z'))
    
    // Test date conversion
    const utcDate = new Date()
    const baDate = toBuenosAires(utcDate)
    console.log('UTC Date:', utcDate.toISOString())
    console.log('Buenos Aires Date:', baDate.format('YYYY-MM-DD HH:mm:ss Z'))
    
    // Test time parsing
    const morningTime = parseTimeInBuenosAires('09:30')
    console.log('9:30 AM in Buenos Aires:', morningTime.format('YYYY-MM-DD HH:mm:ss Z'))
    
    // Test business hours
    const businessHours = getBusinessHoursInBuenosAires()
    console.log('Business hours slots (first 5):', businessHours.slice(0, 5))
    
    // Test date comparisons
    console.log('Is today?', isTodayInBuenosAires(now))
    console.log('Is this week?', isThisWeekInBuenosAires(now))
    console.log('Is this month?', isThisMonthInBuenosAires(now))
    
    console.log('✅ Timezone implementation test completed successfully')
    return true
  } catch (error) {
    console.error('❌ Timezone implementation test failed:', error)
    return false
  }
}

// Export for use in components or pages during development
export {
  nowInBuenosAires,
  toBuenosAires,
  formatInBuenosAires,
  startOfDayInBuenosAires,
  endOfDayInBuenosAires,
  startOfWeekInBuenosAires,
  endOfWeekInBuenosAires,
  startOfMonthInBuenosAires,
  endOfMonthInBuenosAires,
  isTodayInBuenosAires,
  isThisWeekInBuenosAires,
  isThisMonthInBuenosAires,
  parseTimeInBuenosAires,
  getBusinessHoursInBuenosAires,
  TIMEZONE
} from './timezone'