<template>
  <div>

    <!-- Loading State -->
    <div
      v-if="techniciansStore.loading"
      class="flex items-center justify-center py-12"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-gray-500">Cargando configuración...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="techniciansStore.error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <div class="flex">
        <IconAlertCircleOutline class="w-6 h-6 text-red-400 mt-0.5" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            Error
          </h3>
          <p class="text-sm text-red-700 mt-1">
            {{ techniciansStore.error }}
          </p>
          <button
            @click="techniciansStore.clearError"
            class="text-sm text-red-600 underline mt-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Setup Banner -->
    <div
      v-else-if="!techniciansStore.technician"
      data-tour-id="settings-profile-banner"
      class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
    >
        <div class="flex items-start">
          <IconInformationOutline class="w-7 h-7 text-blue-600 mt-1" />
          <div class="ml-4 flex-1">
            <h3 class="text-lg font-semibold text-blue-900 mb-2">
              ¡Bienvenido a InstalaPro!
            </h3>
            <p class="text-blue-800 mb-4">
              Para comenzar a usar la plataforma, necesitas completar tu perfil profesional.
              Esta información será utilizada para gestionar tu negocio y generar tu página de reservas personalizada.
            </p>
            <button
              @click="openSetupModal"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                isDemoUser ? 'bg-blue-600 hover:bg-blue-600/90' : 'bg-blue-600 hover:bg-blue-700'
              ]"
              :title="isDemoUser ? 'Ingresá con Google para completar tu perfil' : 'Completar perfil profesional'"
            >
              Completar Perfil
            </button>
          </div>
        </div>
      </div>

    <!-- Account Deactivated Banner -->
    <div
      v-else-if="techniciansStore.technician && techniciansStore.isAccountDeactivated"
      data-tour-id="settings-account-deactivated"
      class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6"
    >
      <div class="flex items-start">
        <IconAccountCancel class="w-7 h-7 text-red-600 mt-1" />
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-semibold text-red-900 mb-2">
            Cuenta Desactivada
          </h3>
          <p class="text-red-800 mb-2">
            Tu cuenta fue desactivada el {{ formatDeactivationDate }}.
          </p>
          <p class="text-red-700 text-sm mb-4">
            Mientras tu cuenta esté desactivada, tu perfil estará oculto y no recibirás nuevas reservas.
          </p>
          <button
            @click="handleReactivateAccount"
            :disabled="isReactivating"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50',
              isDemoUser ? 'bg-green-600 hover:bg-green-600/90' : 'bg-green-600 hover:bg-green-700'
            ]"
            :title="isDemoUser ? 'Ingresá con Google para reactivar tu cuenta' : 'Reactivar cuenta profesional'"
          >
            {{ isReactivating ? 'Reactivando...' : 'Reactivar Cuenta' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Incomplete Profile Banner -->
    <div
      v-else-if="techniciansStore.technician && !techniciansStore.hasRequiredInfo"
      data-tour-id="settings-profile-incomplete"
      class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6"
    >
      <div class="flex items-start">
        <IconAlertOutline class="w-7 h-7 text-yellow-600 mt-1" />
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-semibold text-yellow-900 mb-2">
            Información Requerida Faltante
          </h3>
          <p class="text-yellow-800 mb-4">
            Tu perfil necesita información básica (nombre y teléfono) para funcionar correctamente.
          </p>
          <button
            @click="openEditProfileModal"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
              isDemoUser ? 'bg-yellow-600 hover:bg-yellow-600/90' : 'bg-yellow-600 hover:bg-yellow-700'
            ]"
            :title="isDemoUser ? 'Ingresá con Google para completar tu información' : 'Completar información requerida'"
          >
            Completar Ahora
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Cards Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
    >
      <!-- Personal Information Card -->
      <div data-tour-id="settings-profile-card" class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <IconAccountOutline class="w-6 h-6 text-blue-600" />
            Información Personal
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Datos básicos de tu perfil profesional
          </p>
        </div>
        <div class="px-6 py-4 space-y-4">
          <!-- Name -->
          <div v-if="techniciansStore.technician" class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-600">Nombre Completo</p>
              <p class="text-base font-medium text-gray-900">{{ techniciansStore.technician.name }}</p>
            </div>
          </div>

          <!-- Business Name -->
          <div v-if="techniciansStore.technician?.businessName" class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-600">Nombre de Negocio</p>
              <p class="text-base font-medium text-gray-900">{{ techniciansStore.technician.businessName }}</p>
              <p class="text-xs text-gray-500 mt-1">Se muestra en tu página de reservas</p>
            </div>
          </div>

          <!-- Contact Info Grid -->
          <div class="grid grid-cols-1 gap-4">
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <IconPhoneOutline class="w-5 h-5 text-gray-600 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-600">Teléfono</p>
                <p class="text-sm font-medium text-gray-900">{{ techniciansStore.technician?.phone }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <IconEmailOutline class="w-5 h-5 text-gray-600 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-600">Email Principal</p>
                <p class="text-sm font-medium text-gray-900 truncate">{{ techniciansStore.technician?.email }}</p>
                <p class="text-xs text-gray-500">(desde cuenta Google)</p>
              </div>
            </div>

            <div 
              v-if="techniciansStore.technician?.secondaryEmail"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <IconEmailOutline class="w-5 h-5 text-gray-600 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-600">Email Secundario</p>
                <p class="text-sm font-medium text-gray-900 truncate">{{ techniciansStore.technician.secondaryEmail }}</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="openEditProfileModal"
              :class="[
                'flex-1 h-10 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                isDemoUser ? 'bg-blue-600 hover:bg-blue-600/90' : 'bg-blue-600 hover:bg-blue-700'
              ]"
              :title="isDemoUser ? 'Ingresá con Google para editar tu perfil' : 'Editar perfil profesional'"
            >
              <IconPencilOutline class="w-5 h-5" />
              Editar Perfil
            </button>
            <button
              type="button"
              @click="openCloseAccountModal"
              :class="[
                'border bg-transparent rounded-lg px-3 h-10 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                isDemoUser
                  ? 'text-red-600 border-red-200 hover:bg-red-50/80'
                  : 'text-red-600 border-red-200 hover:bg-red-50'
              ]"
              :title="isDemoUser ? 'Ingresá con Google para desactivar tu cuenta' : 'Desactivar cuenta temporalmente'"
            >
              <IconAccountCancel class="w-5 h-5" />
              Desactivar cuenta
            </button>
          </div>
        </div>
      </div>

      <!-- URL Slug Card -->
      <div data-tour-id="settings-booking-url" class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <IconLink class="w-6 h-6 text-blue-600" />
            URL de Reservas
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Personaliza tu link de reservas para compartir con clientes
          </p>
        </div>
        <div class="px-6 py-4 space-y-4">
          <!-- Current URL Display -->
          <div v-if="techniciansStore.technician?.urlSlug" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-xs font-medium text-blue-700 mb-2">Tu URL actual:</p>
            <div class="flex items-center gap-2">
              <code class="flex-1 min-w-0 text-sm font-mono text-blue-900 bg-white px-3 py-2 rounded border border-blue-200 truncate">
                instalapro-booking.web.app/{{ techniciansStore.technician.urlSlug }}
              </code>
              <button
                @click="copyUrlToClipboard"
                class="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                title="Copiar URL"
              >
                <IconContentCopy class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Slug Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Personalizar URL
            </label>
            <input
              v-model="slugInput"
              @input="handleSlugInput($event)"
              @focus="guardSlugEditing"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :readonly="isDemoUser"
              :title="isDemoUser ? 'Ingresá con Google para personalizar tu URL' : 'Ingresa tu URL personalizada'"
              placeholder="ej: juan-perez-instalaciones"
            />
            <p class="text-xs text-gray-500 mt-1">
              Solo letras minúsculas, números y guiones
            </p>

            <!-- Warning when editing existing URL -->
            <div v-if="techniciansStore.technician?.urlSlug && slugPreview && slugPreview !== techniciansStore.technician.urlSlug" class="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <IconAlertOutline class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-yellow-800">
                <p class="font-medium mb-1">Advertencia</p>
                <p>Al cambiar tu URL, los clientes que tengan guardada tu URL anterior ya no podrán acceder a tu perfil. Asegúrate de compartir la nueva URL con tus clientes.</p>
              </div>
            </div>
          </div>

          <!-- Slug Preview -->
          <div v-if="slugPreview" class="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p class="text-xs font-medium text-gray-600 mb-1">Vista previa:</p>
            <code class="text-sm font-mono text-gray-900">
              instalapro-booking.web.app/{{ slugPreview }}
            </code>
          </div>

          <!-- Validation Status -->
          <div v-if="slugValidationMessage" class="flex items-start gap-2" :class="slugValidationSuccess ? 'text-green-700' : 'text-red-700'">
            <IconCheckCircle v-if="slugValidationSuccess" class="w-5 h-5 mt-0.5" />
            <IconAlertCircleOutline v-else class="w-5 h-5 mt-0.5" />
            <p class="text-sm">{{ slugValidationMessage }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              @click="verifySlug"
              :disabled="!slugPreview || isVerifyingSlug"
              :class="[
                'flex-1 px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                isDemoUser
                  ? 'border-blue-600 text-blue-600 hover:bg-blue-50/80'
                  : 'border-blue-600 text-blue-600 hover:bg-blue-50'
              ]"
              :title="isDemoUser ? 'Ingresá con Google para verificar tu URL personalizada' : 'Verificar disponibilidad de URL'"
            >
              {{ isVerifyingSlug ? 'Verificando...' : 'Verificar URL' }}
            </button>
            <button
              @click="saveSlug"
              :disabled="!slugPreview || !slugValidationSuccess || isSavingSlug"
              :class="[
                'flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                isDemoUser ? 'bg-blue-600 hover:bg-blue-600/90' : 'bg-blue-600 hover:bg-blue-700'
              ]"
              :title="isDemoUser ? 'Ingresá con Google para guardar tu nueva URL' : 'Guardar URL personalizada'"
            >
              {{ isSavingSlug ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Services Card -->
      <div data-tour-id="settings-services-card" class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <IconToolboxOutline class="w-6 h-6 text-blue-600" />
            Tipos de Servicio
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Configura los servicios que ofreces con sus precios y duraciones
          </p>
        </div>
        <div class="px-6 py-4 space-y-4">
          <!-- Loading State -->
          <div v-if="serviceTypesStore.loading" class="text-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
            <p class="text-sm text-gray-500">Cargando servicios...</p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="serviceTypesStore.activeServiceTypes.length === 0" class="text-center py-8">
            <IconToolboxOutline class="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No tienes servicios configurados
            </h3>
            <p class="text-gray-600 mb-4">
              Agrega los tipos de servicio que ofreces para agilizar la creación de trabajos
            </p>
            <button
              @click="openNewServiceModal"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                isDemoUser ? 'bg-blue-600 hover:bg-blue-600/90' : 'bg-blue-600 hover:bg-blue-700'
              ]"
              :title="isDemoUser ? 'Ingresá con Google para agregar servicios' : 'Agregar primer servicio'"
            >
              Agregar Primer Servicio
            </button>
          </div>

          <!-- Services List -->
          <div v-else class="space-y-4">
            <div class="space-y-3">
              <div
                v-for="service in serviceTypesStore.activeServiceTypes"
                :key="service.id"
                class="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <IconSnowflakeVariant v-if="service.category === 'Instalación'" class="w-5 h-5 text-blue-600" />
                    <IconPaintBrush v-else-if="service.category === 'Pintura'" class="w-5 h-5 text-blue-600" />
                    <IconBroom v-else-if="service.category === 'Limpieza'" class="w-5 h-5 text-blue-600" />
                    <IconWrenchOutline v-else class="w-5 h-5 text-blue-600" />
                    <h3 class="font-medium text-gray-900">{{ service.name }}</h3>
                    <span class="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                      {{ service.category }}
                    </span>
                  </div>
                  <div class="flex gap-1">
                    <button
                      @click="editService(service)"
                      :class="[
                        'p-1.5 rounded transition-colors',
                        isDemoUser ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/80' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      ]"
                      :title="isDemoUser ? 'Ingresá con Google para editar servicios' : 'Editar servicio'"
                    >
                      <IconPencilOutline class="w-5 h-5" />
                    </button>
                    <button
                      @click="deleteService(service)"
                      :class="[
                        'p-1.5 rounded transition-colors',
                        isDemoUser ? 'text-red-400 hover:text-red-600 hover:bg-red-50/80' : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                      ]"
                      :title="isDemoUser ? 'Ingresá con Google para eliminar servicios' : 'Eliminar servicio'"
                    >
                      <IconDeleteOutline class="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p v-if="service.description" class="text-sm text-gray-600 mb-3">{{ service.description }}</p>

                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1.5">
                    <IconCurrencyUsd class="w-5 h-5 text-blue-600" />
                    <span class="font-semibold text-gray-900">${{ formatPrice(service.basePrice) }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <IconClock class="w-5 h-5 text-gray-600" />
                    <span class="text-sm text-gray-600">{{ Math.round(service.estimatedDuration / 60) }}h {{ service.estimatedDuration % 60 }}min</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Service Button (when services exist) -->
            <button
              @click="openNewServiceModal"
              :class="[
                'w-full h-12 border-2 border-dashed rounded-lg bg-transparent transition-colors flex items-center justify-center gap-2',
                isDemoUser
                  ? 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50/80 hover:text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'
              ]"
              :title="isDemoUser ? 'Ingresá con Google para agregar servicios' : 'Agregar nuevo servicio'"
            >
              <IconPlus class="w-5 h-5" />
              Agregar Servicio
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Access Card -->
      <div data-tour-id="settings-quick-access" class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <IconClock class="w-6 h-6 text-blue-600" />
            Accesos Rápidos
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Gestiona tu agenda y disponibilidad
          </p>
        </div>
        <div class="px-6 py-4 space-y-4">
          <!-- Current Week Stats -->
          <div v-if="slotAvailabilityStore.initialized" class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-900 mb-3">Esta Semana</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">{{ slotAvailabilityStore.availableSlots.length }}</div>
                <div class="text-xs text-gray-600">Horarios Disponibles</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-gray-600">{{ slotAvailabilityStore.totalSlots - slotAvailabilityStore.availableSlots.length }}</div>
                <div class="text-xs text-gray-600">Horarios Ocupados</div>
              </div>
            </div>
          </div>

          <!-- Quick Access Buttons -->
          <div class="space-y-3">
            <NuxtLink
              to="/schedule"
              class="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 no-underline"
            >
              <IconCalendar class="w-5 h-5" />
              Ir a la Agenda
            </NuxtLink>
            
            <div class="text-xs text-gray-500 space-y-1">
              <p>• Configura tu disponibilidad desde la página Agenda</p>
              <p>• Los horarios con trabajos programados se cierran automáticamente</p>
              <p>• Puedes ver y editar hasta 4 semanas por adelantado</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Edit Profile Modal -->
    <ModalStructure
      ref="editProfileModalRef"
      title="Editar Perfil"
      @on-close="closeEditProfileModal"
    >
      <form @submit.prevent="saveProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              v-model="currentForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingrese su nombre completo"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre de Negocio (Opcional)
            </label>
            <input
              v-model="currentForm.businessName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej. Instalaciones Pérez"
            />
            <p class="text-xs text-gray-500 mt-1">
              Se mostrará en tu página de reservas si lo agregas
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              v-model="currentForm.phone"
              type="tel"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+54 11 1234-5678"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email Principal
            </label>
            <input
              :value="authStore.userEmail"
              type="email"
              disabled
              class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              placeholder="correo@ejemplo.com"
            />
            <p class="text-xs text-gray-500 mt-1">
              Este email viene de tu cuenta de Google y no se puede cambiar
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email Secundario (Opcional)
            </label>
            <input
              v-model="currentForm.secondaryEmail"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="otro@ejemplo.com"
            />
            <p class="text-xs text-gray-500 mt-1">
              Email adicional para recibir notificaciones
            </p>
          </div>
        </div>
        
        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeEditProfileModal"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :class="[
              'px-4 py-2 text-white rounded-lg transition-colors',
              isLoading
                ? 'bg-blue-300 cursor-not-allowed'
                : isDemoUser
                  ? 'bg-blue-600 hover:bg-blue-600/90'
                  : 'bg-blue-600 hover:bg-blue-700'
            ]"
            :disabled="isLoading"
            :title="isDemoUser ? (techniciansStore.technician ? 'Ingresá con Google para editar tu perfil' : 'Ingresá con Google para completar tu perfil') : undefined"
          >
            {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </ModalStructure>

    <!-- Close Account Modal -->
    <ModalStructure
      ref="closeAccountModalRef"
      title="Desactivar cuenta"
      @on-close="closeCloseAccountModal"
    >
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <IconAccountCancel class="w-7 h-7 text-red-500 mt-1" />
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              ¿Estás seguro que deseas desactivar tu cuenta?
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Esta acción marcará tu cuenta como inactiva. Podrás reactivarla más tarde contactando a soporte.
            </p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Tu perfil será ocultado</li>
              <li>• No recibirás nuevas reservas</li>
              <li>• Tus datos se mantendrán seguros</li>
            </ul>
          </div>
        </div>
        
        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeCloseAccountModal"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleCloseAccount"
            :class="[
              'px-4 py-2 text-white rounded-lg transition-colors',
              isClosingAccount
                ? 'bg-red-300 cursor-not-allowed'
                : isDemoUser
                  ? 'bg-red-600 hover:bg-red-600/90'
                  : 'bg-red-600 hover:bg-red-700'
            ]"
            :disabled="isClosingAccount"
            :title="isDemoUser ? 'Ingresá con Google para desactivar tu cuenta' : 'Desactivar cuenta profesional'"
          >
            {{ isClosingAccount ? 'Desactivando...' : 'Desactivar cuenta' }}
          </button>
        </div>
      </div>
    </ModalStructure>

    <!-- Configuration Tour -->
    <ConfiguracionTour />

    <!-- Service Type Modal -->
    <ModalStructure
      ref="serviceModalRef"
      :title="editingService ? 'Editar Servicio' : 'Nuevo Servicio'"
      @on-close="closeServiceModal"
    >
      <form @submit.prevent="saveService" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Servicio *
            </label>
            <input
              v-model="serviceForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej. Instalación de Split 3500 BTU"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              v-if="!showCustomCategoryInput"
              v-model="serviceForm.category"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleCategoryChange"
            >
              <option value="">Seleccionar categoría...</option>
              <option value="Instalación">Instalación</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Reparación">Reparación</option>
              <option value="Consultoría">Consultoría</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Pintura">Pintura</option>
              <option value="custom">Otra (personalizada)</option>
            </select>
            <div v-if="showCustomCategoryInput" class="space-y-2">
              <input
                v-model="serviceForm.category"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese categoría personalizada"
              />
              <button
                type="button"
                @click="cancelCustomCategory"
                class="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Volver a opciones predefinidas
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Precio Base *
            </label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500">$</span>
              <input
                v-model="serviceForm.basePrice"
                type="number"
                min="0"
                step="100"
                required
                class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Duración (minutos) *
            </label>
            <input
              v-model="serviceForm.estimatedDuration"
              type="number"
              min="15"
              max="480"
              step="15"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="120"
            />
            <p class="text-xs text-gray-500 mt-1">
              Entre 15 minutos y 8 horas ({{ Math.round((serviceForm.estimatedDuration || 0) / 60) }}h {{ (serviceForm.estimatedDuration || 0) % 60 }}min)
            </p>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              v-model="serviceForm.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción detallada del servicio..."
            />
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeServiceModal"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :class="[
              'px-4 py-2 text-white rounded-lg transition-colors',
              isSavingService
                ? 'bg-blue-300 cursor-not-allowed'
                : isDemoUser
                  ? 'bg-blue-600 hover:bg-blue-600/90'
                  : 'bg-blue-600 hover:bg-blue-700'
            ]"
            :disabled="isSavingService"
            :title="isDemoUser ? (editingService ? 'Ingresá con Google para editar servicios' : 'Ingresá con Google para agregar servicios') : undefined"
          >
            {{ isSavingService ? 'Guardando...' : editingService ? 'Actualizar' : 'Crear Servicio' }}
          </button>
        </div>
      </form>
    </ModalStructure>

  </div>
</template>

<script setup>
// Utils & components
import { formatPrice } from '@/utils'
import ConfiguracionTour from '~/components/onboarding/ConfiguracionTour.vue'

// Icons
import IconAlertCircleOutline from '~icons/mdi/alert-circle-outline'
import IconInformationOutline from '~icons/mdi/information-outline'
import IconAlertOutline from '~icons/mdi/alert-outline'
import IconPencilOutline from '~icons/mdi/pencil-outline'
import IconAccountCancel from '~icons/mdi/account-cancel'
import IconToolboxOutline from '~icons/mdi/toolbox-outline'
import IconCurrencyUsd from '~icons/mdi/currency-usd'
import IconClock from '~icons/mdi/clock-outline'
import IconDeleteOutline from '~icons/mdi/delete-outline'
import IconPlus from '~icons/mdi/plus'
import IconAccountOutline from '~icons/mdi/account-outline'
import IconPhoneOutline from '~icons/mdi/phone-outline'
import IconEmailOutline from '~icons/mdi/email-outline'
import IconSnowflakeVariant from '~icons/mdi/snowflake-variant'
import IconWrenchOutline from '~icons/mdi/wrench-outline'
import IconPaintBrush from '~icons/mdi/format-paint'
import IconBroom from '~icons/mdi/broom'
import IconCalendar from '~icons/mdi/calendar'
import IconLink from '~icons/mdi/link-variant'
import IconContentCopy from '~icons/mdi/content-copy'
import IconCheckCircle from '~icons/mdi/check-circle'

// ==========================================
// PAGE METADATA
// ==========================================

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// ==========================================
// COMPOSABLES
// ==========================================

const techniciansStore = useTechniciansStore()
const serviceTypesStore = useServiceTypesStore()
const slotAvailabilityStore = useSlotAvailabilityStore()
const authStore = useAuthStore()
const { requireFullAccount, isDemoUser } = useDemoAccessGuard()

// ==========================================
// REFS & REACTIVE DATA
// ==========================================

const editProfileModalRef = ref()
const closeAccountModalRef = ref()
const serviceModalRef = ref()
const isLoading = ref(false)
const isClosingAccount = ref(false)
const isReactivating = ref(false)
const isSavingService = ref(false)
const editingService = ref(null)
const showCustomCategoryInput = ref(false)

// URL Slug management
const slugInput = ref('')
const slugPreview = ref('')
const slugValidationMessage = ref('')
const slugValidationSuccess = ref(false)
const isVerifyingSlug = ref(false)
const isSavingSlug = ref(false)


// Form for editing/creating profile
const editForm = reactive({
  name: '',
  phone: '',
  secondaryEmail: '',
  businessName: ''
})

// Form for initial setup
const setupForm = reactive({
  name: '',
  phone: '',
  secondaryEmail: '',
  businessName: ''
})

// Form for service types
const serviceForm = reactive({
  name: '',
  description: '',
  basePrice: '',
  estimatedDuration: 120,
  category: ''
})

// ==========================================
// COMPUTED PROPERTIES
// ==========================================

const currentForm = computed(() => {
  return techniciansStore.technician ? editForm : setupForm
})

const formatDeactivationDate = computed(() => {
  if (!techniciansStore.deactivationDate) return ''
  
  const date = new Date(techniciansStore.deactivationDate)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})


// ==========================================
// METHODS - MODAL MANAGEMENT
// ==========================================

const openSetupModal = () => {
  if (requireFullAccount('completar tu perfil')) {
    return
  }

  // Reset setup form
  setupForm.name = ''
  setupForm.phone = ''
  setupForm.secondaryEmail = ''
  setupForm.businessName = ''

  if (editProfileModalRef.value) {
    editProfileModalRef.value.showModal()
  }
}

const openEditProfileModal = () => {
  if (requireFullAccount('editar tu perfil')) {
    return
  }

  if (techniciansStore.technician) {
    // Pre-fill form with current data
    editForm.name = techniciansStore.technician.name || ''
    editForm.phone = techniciansStore.technician.phone || ''
    editForm.secondaryEmail = techniciansStore.technician.secondaryEmail || ''
    editForm.businessName = techniciansStore.technician.businessName || ''
  }

  if (editProfileModalRef.value) {
    editProfileModalRef.value.showModal()
  }
}

const closeEditProfileModal = () => {
  if (editProfileModalRef.value) {
    editProfileModalRef.value.closeModal()
  }
}

const openCloseAccountModal = () => {
  if (requireFullAccount('desactivar tu cuenta')) {
    return
  }

  if (closeAccountModalRef.value) {
    closeAccountModalRef.value.showModal()
  }
}

const closeCloseAccountModal = () => {
  if (closeAccountModalRef.value) {
    closeAccountModalRef.value.closeModal()
  }
}

// ==========================================
// METHODS - FORM HANDLERS
// ==========================================

const saveProfile = async () => {
  if (requireFullAccount(techniciansStore.technician ? 'editar tu perfil' : 'completar tu perfil')) {
    return
  }

  try {
    isLoading.value = true
    
    const isSetup = !techniciansStore.technician
    let success = false

    if (isSetup) {
      // Creating new technician profile
      success = await techniciansStore.createTechnician({
        name: setupForm.name,
        phone: setupForm.phone,
        secondaryEmail: setupForm.secondaryEmail || undefined,
        businessName: setupForm.businessName || undefined
      })
    } else {
      // Updating existing profile
      success = await techniciansStore.updateProfile({
        name: editForm.name,
        phone: editForm.phone,
        secondaryEmail: editForm.secondaryEmail || undefined,
        businessName: editForm.businessName || undefined
      })
    }
    
    if (success) {
      closeEditProfileModal()
      // Toast notification would go here
    }
    
  } catch (error) {
    console.error('Error saving profile:', error)
    // Toast error notification would go here
  } finally {
    isLoading.value = false
  }
}

const handleCloseAccount = async () => {
  if (requireFullAccount('desactivar tu cuenta')) {
    return
  }

  try {
    isClosingAccount.value = true
    
    const success = await techniciansStore.closeAccount()
    
    if (success) {
      closeCloseAccountModal()
      // Toast notification would go here
    }
    
  } catch (error) {
    console.error('Error closing account:', error)
    // Toast error notification would go here
  } finally {
    isClosingAccount.value = false
  }
}

const handleReactivateAccount = async () => {
  if (requireFullAccount('reactivar tu cuenta')) {
    return
  }

  try {
    isReactivating.value = true
    
    const success = await techniciansStore.reactivateAccount()
    
    if (success) {
      useToast().success('Cuenta reactivada correctamente')
    }
    
  } catch (error) {
    console.error('Error reactivating account:', error)
    // Toast error notification would go here
  } finally {
    isReactivating.value = false
  }
}

// ==========================================
// METHODS - SERVICE TYPES
// ==========================================

const openNewServiceModal = () => {
  if (requireFullAccount('agregar servicios')) {
    return
  }

  editingService.value = null
  serviceForm.name = ''
  serviceForm.description = ''
  serviceForm.basePrice = ''
  serviceForm.estimatedDuration = 120
  serviceForm.category = ''
  showCustomCategoryInput.value = false
  
  if (serviceModalRef.value) {
    serviceModalRef.value.showModal()
  }
}

const editService = (service) => {
  if (requireFullAccount('editar servicios')) {
    return
  }

  editingService.value = service
  serviceForm.name = service.name
  serviceForm.description = service.description || ''
  serviceForm.basePrice = service.basePrice.toString()
  serviceForm.estimatedDuration = service.estimatedDuration
  serviceForm.category = service.category
  
  // Check if category is one of the predefined ones
  const predefinedCategories = ['Instalación', 'Mantenimiento', 'Reparación', 'Consultoría', 'Limpieza', 'Pintura']
  showCustomCategoryInput.value = !predefinedCategories.includes(service.category)
  
  if (serviceModalRef.value) {
    serviceModalRef.value.showModal()
  }
}

const handleCategoryChange = () => {
  if (serviceForm.category === 'custom') {
    showCustomCategoryInput.value = true
    serviceForm.category = ''
  } else {
    showCustomCategoryInput.value = false
  }
}

const cancelCustomCategory = () => {
  showCustomCategoryInput.value = false
  serviceForm.category = ''
}

const closeServiceModal = () => {
  editingService.value = null
  showCustomCategoryInput.value = false
  if (serviceModalRef.value) {
    serviceModalRef.value.closeModal()
  }
}

const saveService = async () => {
  if (requireFullAccount(editingService.value ? 'editar servicios' : 'agregar servicios')) {
    return
  }

  try {
    isSavingService.value = true
    
    const serviceData = {
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim() || undefined,
      basePrice: parseFloat(serviceForm.basePrice),
      estimatedDuration: parseInt(serviceForm.estimatedDuration),
      category: serviceForm.category.trim()
    }
    
    let success = false
    
    if (editingService.value) {
      // Updating existing service
      success = await serviceTypesStore.updateServiceType(editingService.value.id, serviceData)
    } else {
      // Creating new service
      success = await serviceTypesStore.createServiceType(serviceData)
    }
    
    if (success) {
      closeServiceModal()
    }
    
  } catch (error) {
    console.error('Error saving service:', error)
  } finally {
    isSavingService.value = false
  }
}

const deleteService = async (service) => {
  if (requireFullAccount('eliminar servicios')) {
    return
  }

  if (!confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) {
    return
  }
  
  try {
    const success = await serviceTypesStore.deleteServiceType(service.id)
    
    if (success) {
      useToast().success('Servicio eliminado correctamente')
    }
    
  } catch (error) {
    console.error('Error deleting service:', error)
  }
}


// ==========================================
// METHODS - URL SLUG MANAGEMENT
// ==========================================

const slugify = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

const guardSlugEditing = (event) => {
  if (requireFullAccount('configurar tu URL de reservas')) {
    if (event?.preventDefault) {
      event.preventDefault()
    }
    if (event?.target?.blur) {
      event.target.blur()
    }
    return true
  }

  return false
}

const handleSlugInput = (event) => {
  if (guardSlugEditing(event)) {
    slugInput.value = techniciansStore.technician?.urlSlug || ''
    slugPreview.value = slugInput.value
    return
  }

  slugPreview.value = slugify(slugInput.value)
  slugValidationMessage.value = ''
  slugValidationSuccess.value = false
}

const verifySlug = async () => {
  if (requireFullAccount('configurar tu URL de reservas')) {
    return
  }

  if (!slugPreview.value) return

  isVerifyingSlug.value = true
  slugValidationMessage.value = ''
  slugValidationSuccess.value = false

  try {
    const result = await techniciansStore.checkSlugAvailability(slugPreview.value)

    if (result.error) {
      slugValidationMessage.value = result.error
      slugValidationSuccess.value = false
    } else if (result.available) {
      slugValidationMessage.value = '¡URL disponible!'
      slugValidationSuccess.value = true
    } else {
      slugValidationMessage.value = 'Esta URL ya está en uso. Por favor, elige otra.'
      slugValidationSuccess.value = false
    }
  } catch (error) {
    slugValidationMessage.value = 'Error verificando la URL'
    slugValidationSuccess.value = false
  } finally {
    isVerifyingSlug.value = false
  }
}

const saveSlug = async () => {
  if (requireFullAccount('configurar tu URL de reservas')) {
    return
  }

  if (!slugPreview.value || !slugValidationSuccess.value) return

  isSavingSlug.value = true

  try {
    const success = await techniciansStore.updateProfile({
      urlSlug: slugPreview.value
    })

    if (success) {
      useToast().success('URL guardada correctamente')
      slugInput.value = ''
      slugPreview.value = ''
      slugValidationMessage.value = ''
      slugValidationSuccess.value = false
    } else {
      useToast().error('Error guardando la URL')
    }
  } catch (error) {
    console.error('Error saving slug:', error)
    useToast().error('Error guardando la URL')
  } finally {
    isSavingSlug.value = false
  }
}

const copyUrlToClipboard = async () => {
  if (!techniciansStore.technician?.urlSlug) return

  const url = `https://instalapro-booking.web.app/${techniciansStore.technician.urlSlug}`

  try {
    await navigator.clipboard.writeText(url)
    useToast().success('URL copiada al portapapeles')
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    useToast().error('Error copiando la URL')
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Initialize technicians store
  await techniciansStore.initialize()
  // Initialize service types store
  await serviceTypesStore.initialize()
  // Initialize slot availability store
  await slotAvailabilityStore.initialize()

  // Pre-fill slug input if exists
  if (techniciansStore.technician?.urlSlug) {
    slugInput.value = techniciansStore.technician.urlSlug
    slugPreview.value = techniciansStore.technician.urlSlug
  }
})
</script>
