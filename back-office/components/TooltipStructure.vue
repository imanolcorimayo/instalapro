<template>
  <div class="relative inline-block">
    <!-- Trigger -->
    <div
      ref="triggerRef"
      @click="toggleTooltip"
    >
      <slot name="trigger" />
    </div>

    <!-- Tooltip Backdrop (click outside to close) -->
    <div
      v-if="isVisible"
      class="fixed inset-0 z-40 tooltip-namespace"
      @click="closeTooltip"
    />

    <!-- Tooltip Content -->
    <Transition
      name="tooltip-fade"
      appear
    >
      <div
        v-if="isVisible"
        ref="tooltipRef"
        :class="[
          'absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg',
          'min-w-48 max-w-xs',
          'transform transition-all duration-150',
          tooltipClass,
          positionClasses
        ]"
        @click.stop
      >
        <!-- Tooltip Header -->
        <div
          v-if="title"
          class="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg"
        >
          <h3 class="font-medium text-gray-800 text-sm">
            {{ title }}
          </h3>
        </div>

        <!-- Tooltip Content -->
        <div class="p-3">
          <slot name="content" />
        </div>

        <!-- Tooltip Footer -->
        <div
          v-if="$slots.footer"
          class="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
type TooltipPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-center' | 'top-center'

interface Props {
  title?: string
  tooltipClass?: string
  position?: TooltipPosition
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  tooltipClass: '',
  position: 'bottom-left'
})

// ==========================================
// STATE
// ==========================================

const isVisible = ref<boolean>(false)
const triggerRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()
const actualPosition = ref<TooltipPosition>(props.position)

// ==========================================
// COMPUTED
// ==========================================

const positionClasses = computed(() => {
  const positions = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'bottom-center': 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
    'top-center': 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
  }
  
  return positions[actualPosition.value]
})

// ==========================================
// METHODS
// ==========================================

const showTooltip = (): void => {
  isVisible.value = true
  
  // Calculate optimal position after tooltip is rendered
  nextTick(() => {
    adjustPosition()
  })
}

const closeTooltip = (): void => {
  isVisible.value = false
}

const toggleTooltip = (): void => {
  if (isVisible.value) {
    closeTooltip()
  } else {
    showTooltip()
  }
}

const adjustPosition = (): void => {
  if (!triggerRef.value || !tooltipRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  // Start with the preferred position
  let newPosition = props.position

  // Check if tooltip goes outside viewport boundaries
  const spaceBelow = viewportHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top
  const spaceRight = viewportWidth - triggerRect.left
  const spaceLeft = triggerRect.right

  // Vertical position adjustment
  if (props.position.startsWith('bottom') && spaceBelow < tooltipRect.height + 10) {
    // Not enough space below, try to position above
    if (spaceAbove >= tooltipRect.height + 10) {
      newPosition = props.position.replace('bottom', 'top') as TooltipPosition
    }
  } else if (props.position.startsWith('top') && spaceAbove < tooltipRect.height + 10) {
    // Not enough space above, try to position below
    if (spaceBelow >= tooltipRect.height + 10) {
      newPosition = props.position.replace('top', 'bottom') as TooltipPosition
    }
  }

  // Horizontal position adjustment
  if (newPosition.endsWith('-right') && spaceRight < tooltipRect.width + 10) {
    // Not enough space on the right, try left
    if (spaceLeft >= tooltipRect.width + 10) {
      newPosition = newPosition.replace('-right', '-left') as TooltipPosition
    }
  } else if (newPosition.endsWith('-left') && spaceLeft < tooltipRect.width + 10) {
    // Not enough space on the left, try right
    if (spaceRight >= tooltipRect.width + 10) {
      newPosition = newPosition.replace('-left', '-right') as TooltipPosition
    }
  }

  actualPosition.value = newPosition
}

const handleEscapeKey = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && isVisible.value) {
    closeTooltip()
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  // Add escape key listener
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleEscapeKey)
  }
})

onUnmounted(() => {
  // Clean up escape key listener
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleEscapeKey)
  }
})

// ==========================================
// EXPOSE METHODS TO PARENT
// ==========================================

defineExpose({
  showTooltip,
  closeTooltip,
  toggleTooltip,
  isVisible: readonly(isVisible)
})
</script>

<style scoped>
/* Tooltip fade transition */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.15s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}

.tooltip-fade-enter-to,
.tooltip-fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Ensure tooltip appears above other elements */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  z-index: 50;
}
</style>