<template>
  <ModalStructure
    ref="modalRef"
    :close-on-backdrop-click="false"
    modal-class="max-w-md"
    modal-namespace="demo-upgrade-modal"
    title="¡Modo demo activo!"
    @on-close="handleModalClosed"
  >
    <div class="flex flex-col gap-4">
      <div class="rounded-xl bg-blue-50 border border-blue-100 p-4 flex items-start gap-3">
        <IconLightbulb class="h-6 w-6 text-blue-500 flex-shrink-0" />
        <div class="space-y-1">
          <p class="text-sm text-blue-800 font-medium">
            Estás navegando con datos de ejemplo.
          </p>
          <p class="text-sm text-blue-700">
            Todo lo que ves es una vista previa preparada para que explores sin riesgo.
          </p>
        </div>
      </div>

      <div class="space-y-3 text-sm text-gray-600 leading-relaxed">
        <p v-if="demoState.actionLabel">
          Para <span class="font-medium text-gray-800">{{ demoState.actionLabel }}</span> necesitás ingresar con tu cuenta de Google.
        </p>
        <p v-else>
          Para usar estas herramientas con tus propios datos, ingresá con Google. Es gratis y toma segundos.
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="handleContinueWithGoogle"
        >
          <IconGoogle class="h-5 w-5" />
          Conectar con Google
        </button>
        <button
          type="button"
          class="text-sm text-gray-500 hover:text-gray-700 underline transition"
          @click="handleKeepExploring"
        >
          Seguir explorando datos demo
        </button>
      </div>
    </div>
  </ModalStructure>
</template>

<script setup>
import IconLightbulb from '~icons/mdi/lightbulb-on-outline'
import IconGoogle from '~icons/logos/google-icon'

const modalRef = ref(null)

const { demoState, closeUpgradeModal, resetUpgradeMessage, continueWithGoogle } = useDemoAccessGuard()

watch(
  () => demoState.value.isOpen,
  (isOpen) => {
    if (!modalRef.value) {
      return
    }

    if (isOpen) {
      modalRef.value.showModal()
    } else {
      modalRef.value.closeModal()
    }
  }
)

const handleKeepExploring = () => {
  closeUpgradeModal({ preserveActionLabel: true })
}

const handleContinueWithGoogle = async () => {
  await continueWithGoogle()
}

const handleModalClosed = () => {
  closeUpgradeModal({ preserveActionLabel: true })
  resetUpgradeMessage()
}
</script>
