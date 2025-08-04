<template>
  <Teleport to="body">
    <Transition
      name="modal-fade"
      appear
    >
      <div
        v-if="isVisible"
        :class="[
          'fixed inset-0 z-50 flex items-center justify-center',
          'bg-black bg-opacity-50 backdrop-blur-sm',
          modalNamespace
        ]"
        @click="handleBackdropClick"
      >
        <div
          :class="[
            'bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto',
            'w-full max-w-lg mx-4',
            'transform transition-all duration-200',
            modalClass
          ]"
          @click.stop
        >
          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between p-4 border-b border-gray-200"
          >
            <slot name="header">
              <h2 class="text-xl font-semibold text-gray-800">
                {{ title }}
              </h2>
            </slot>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
              @click="closeModal"
            >
              <Icon
                name="mdi:close"
                class="w-5 h-5"
              />
            </button>
          </div>

          <!-- Content -->
          <div class="p-4">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  modalClass?: string
  closeOnBackdropClick?: boolean
  clickPropagationFilter?: string[]
  modalNamespace?: string
}

interface Emits {
  (e: 'on-close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  modalClass: '',
  closeOnBackdropClick: true,
  clickPropagationFilter: () => [],
  modalNamespace: 'modal-namespace'
})

const emit = defineEmits<Emits>()

// ==========================================
// STATE
// ==========================================

const isVisible = ref<boolean>(false)

// ==========================================
// MODAL CONTROL METHODS
// ==========================================

const showModal = (): void => {
  isVisible.value = true
  
  // Prevent body scroll when modal is open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }
}

const closeModal = (): void => {
  isVisible.value = false
  
  // Restore body scroll
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
  
  emit('on-close')
}

// ==========================================
// EVENT HANDLERS
// ==========================================

const handleBackdropClick = (event: Event): void => {
  if (!props.closeOnBackdropClick) return

  // Check if click should be filtered based on clickPropagationFilter
  const target = event.target as HTMLElement
  const shouldFilter = props.clickPropagationFilter.some(filterClass => {
    return target.closest(`.${filterClass}`)
  })

  if (shouldFilter) return

  closeModal()
}

const handleEscapeKey = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && isVisible.value) {
    closeModal()
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
  // Clean up escape key listener and body scroll
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleEscapeKey)
    document.body.style.overflow = ''
  }
})

// ==========================================
// EXPOSE METHODS TO PARENT
// ==========================================

defineExpose({
  showModal,
  closeModal,
  isVisible: readonly(isVisible)
})
</script>

<style scoped>
/* Modal fade transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}

/* Transform animation for modal content */
.modal-fade-enter-active .bg-white,
.modal-fade-leave-active .bg-white {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from .bg-white,
.modal-fade-leave-to .bg-white {
  transform: scale(0.95) translateY(-20px);
}

.modal-fade-enter-to .bg-white,
.modal-fade-leave-from .bg-white {
  transform: scale(1) translateY(0);
}
</style>