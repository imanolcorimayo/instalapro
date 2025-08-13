<template>
  <span :class="iconClass">{{ iconContent }}</span>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  class: {
    type: String,
    default: ''
  }
})

// Simple icon mapping for common MDI icons
const iconMap = {
  'mdi:air-conditioner': '❄️',
  'mdi:close': '✕',
  'mdi:menu': '☰',
  'mdi:view-dashboard-outline': '📊',
  'mdi:cog-outline': '⚙️',
  'mdi:calendar-outline': '📅',
  'mdi:account-group-outline': '👥',
  'mdi:account-group': '👥',
  'mdi:file-document-outline': '📄',
  'mdi:cash-multiple': '💰',
  'mdi:account': '👤',
  'mdi:bell-outline': '🔔',
  'mdi:calendar-today': '📅',
  'mdi:plus-circle': '➕',
  'mdi:account-plus': '👤➕',
  'mdi:file-document-plus': '📄➕',
  'mdi:whatsapp': '💬'
}

const iconClass = computed(() => {
  const baseClasses = props.class || 'w-5 h-5'
  return `inline-block ${baseClasses}`
})

// Get the emoji representation of the icon
const iconContent = computed(() => {
  return iconMap[props.name] || '❓'
})
</script>