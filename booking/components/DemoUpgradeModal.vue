<template>
  <Teleport to="body">
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8"
      role="dialog"
      aria-modal="true"
      @keydown.esc.prevent="handleClose"
    >
      <div
        ref="modalRef"
        class="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
        tabindex="-1"
      >
        <div class="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <h2 class="text-xl font-semibold text-gray-900">¡Modo demo activo!</h2>
          <button
            type="button"
            class="text-gray-400 transition hover:text-gray-600"
            @click="handleClose"
          >
            <IconClose class="h-5 w-5" />
          </button>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <IconLightbulb class="h-6 w-6 flex-shrink-0 text-blue-500" />
            <div class="space-y-1 text-sm leading-relaxed">
              <p class="font-medium text-blue-800">
                Estás navegando con datos de ejemplo.
              </p>
              <p class="text-blue-700">
                Todo lo que ves es una vista previa preparada para que explores sin riesgo.
              </p>
            </div>
          </div>

          <div class="space-y-3 text-sm leading-relaxed text-gray-600">
            <p v-if="actionLabel">
              Para <span class="font-medium text-gray-800">{{ actionLabel }}</span> necesitás ingresar con tu cuenta de Google.
            </p>
            <p v-else>
              Para usar estas herramientas con tus propios datos, ingresá con Google. Es gratis y toma segundos.
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              @click="handleContinueWithGoogle"
            >
              <IconGoogle class="h-5 w-5" />
              Conectar con Google
            </button>
            <button
              type="button"
              class="text-sm text-gray-500 underline transition hover:text-gray-700"
              @click="handleKeepExploring"
            >
              Seguir con datos demo
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch, nextTick, computed } from 'vue'
import IconClose from '~icons/mdi/close'
import IconLightbulb from '~icons/mdi/lightbulb-on-outline'
import IconGoogle from '~icons/logos/google-icon'

const modalRef = ref<HTMLElement | null>(null)
const { demoState, closeUpgradeModal, resetUpgradeMessage, continueWithGoogle } = useBookingDemoAccess()
const isModalOpen = computed(() => demoState.value.isOpen)
const actionLabel = computed(() => demoState.value.actionLabel)

const handleKeepExploring = () => {
  closeUpgradeModal({ preserveActionLabel: true })
}

const handleContinueWithGoogle = () => {
  continueWithGoogle()
}

const handleClose = () => {
  closeUpgradeModal({ preserveActionLabel: true })
  resetUpgradeMessage()
}

watch(
  () => isModalOpen.value,
  (isOpen) => {
    if (!process.client) {
      return
    }

    document.body.style.overflow = isOpen ? 'hidden' : ''

    if (isOpen) {
      nextTick(() => {
        modalRef.value?.focus()
      })
    }
  }
)

onUnmounted(() => {
  if (!process.client) {
    return
  }
  document.body.style.overflow = ''
})
</script>
