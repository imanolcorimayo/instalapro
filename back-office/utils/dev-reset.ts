/**
 * Development utility to reset localStorage data
 * Use this to clear corrupted data during development
 */

export function resetScheduleData() {
  const keys = [
    'instalapro_schedule_jobs',
    'instalapro_schedule_timeslots', 
    'instalapro_schedule_blocked',
    'instalapro_schedule_options',
    'instalapro_technician_profile',
    'instalapro_technician_services',
    'instalapro_technician_availability'
  ]
  
  keys.forEach(key => {
    localStorage.removeItem(key)
  })
  
  console.log('✅ Schedule data reset complete')
}

export function logScheduleData() {
  const data = {
    jobs: localStorage.getItem('instalapro_schedule_jobs'),
    timeSlots: localStorage.getItem('instalapro_schedule_timeslots'),
    technician: localStorage.getItem('instalapro_technician_profile')
  }
  
  console.log('📊 Current Schedule Data:', data)
}

// Export for global access during development
if (typeof window !== 'undefined') {
  (window as any).resetScheduleData = resetScheduleData
  (window as any).logScheduleData = logScheduleData
}