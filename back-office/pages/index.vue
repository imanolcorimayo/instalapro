<template>
  <div>
      <!-- Welcome Section -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2 cursor-default">¡Bienvenido!</h2>
        <p class="text-gray-600 cursor-default">Gestiona tu negocio de aire acondicionado de manera eficiente</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Trabajos Hoy -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center cursor-default">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Icon name="mdi:calendar-today" class="w-6 h-6 text-white" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 cursor-default">Trabajos Hoy</p>
              <p class="text-2xl font-bold text-gray-900 cursor-default">3</p>
            </div>
          </div>
        </div>

        <!-- Clientes Total -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center cursor-default">
            <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Icon name="mdi:account-group" class="w-6 h-6 text-white" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 cursor-default">Clientes</p>
              <p class="text-2xl font-bold text-gray-900 cursor-default">127</p>
            </div>
          </div>
        </div>

        <!-- Presupuestos -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center cursor-default">
            <div class="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
              <Icon name="mdi:file-document-outline" class="w-6 h-6 text-white" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 cursor-default">Presupuestos</p>
              <p class="text-2xl font-bold text-gray-900 cursor-default">8</p>
            </div>
          </div>
        </div>

        <!-- Facturación -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center cursor-default">
            <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Icon name="mdi:cash-multiple" class="w-6 h-6 text-white" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 cursor-default">Este Mes</p>
              <p class="text-2xl font-bold text-gray-900 cursor-default">$245K</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button class="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center transition-colors">
          <div class="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
            <Icon name="mdi:plus-circle" class="w-6 h-6" />
          </div>
          <h3 class="font-semibold mb-1">Nuevo Trabajo</h3>
          <p class="text-sm opacity-90">Agendar una nueva cita</p>
        </button>

        <button class="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center transition-colors">
          <div class="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
            <Icon name="mdi:account-plus" class="w-6 h-6" />
          </div>
          <h3 class="font-semibold mb-1">Nuevo Cliente</h3>
          <p class="text-sm opacity-90">Agregar cliente nuevo</p>
        </button>

        <button class="bg-yellow-600 hover:bg-yellow-700 text-white p-6 rounded-lg text-center transition-colors">
          <div class="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
            <Icon name="mdi:file-document-plus" class="w-6 h-6" />
          </div>
          <h3 class="font-semibold mb-1">Nuevo Presupuesto</h3>
          <p class="text-sm opacity-90">Crear presupuesto</p>
        </button>

        <button class="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center transition-colors">
          <div class="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
            <Icon name="mdi:whatsapp" class="w-6 h-6" />
          </div>
          <h3 class="font-semibold mb-1">WhatsApp</h3>
          <p class="text-sm opacity-90">Enviar mensaje</p>
        </button>
      </div>

      <!-- Recent Activity -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 cursor-default">Actividad Reciente</h3>
        <div class="bg-white rounded-lg shadow">
          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-center space-x-3 cursor-default">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 text-sm">📝</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 cursor-default">Nuevo trabajo programado</p>
                  <p class="text-xs text-gray-500 cursor-default">Carlos Rodríguez - Instalación Split - Hoy 14:00</p>
                </div>
                <span class="text-xs text-gray-400 cursor-default">Hace 2 min</span>
              </div>

              <div class="flex items-center space-x-3 cursor-default">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-600 text-sm">💰</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 cursor-default">Pago recibido</p>
                  <p class="text-xs text-gray-500 cursor-default">María López - $15,000 - Transferencia</p>
                </div>
                <span class="text-xs text-gray-400 cursor-default">Hace 1 hora</span>
              </div>

              <div class="flex items-center space-x-3 cursor-default">
                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span class="text-yellow-600 text-sm">📋</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 cursor-default">Presupuesto enviado</p>
                  <p class="text-xs text-gray-500 cursor-default">Pedro Fernández - Mantenimiento Central</p>
                </div>
                <span class="text-xs text-gray-400 cursor-default">Hace 3 horas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
// ==========================================
// PAGE METADATA
// ==========================================

definePageMeta({
  layout: 'default'
})

// SEO Meta
useSeoMeta({
  title: 'Dashboard - InstalarPro Back Office',
  description: 'Panel de administración para técnicos de aire acondicionado. Gestión completa del negocio.',
  robots: 'noindex, nofollow' // Back office should not be indexed
})

// ==========================================
// COMPOSABLES
// ==========================================

const technicianStore = useTechnicianStore()

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  // Initialize technician store and create test data if needed
  await technicianStore.initialize()
  
  // If no technician exists, create a test technician
  if (!technicianStore.technician) {
    await technicianStore.createTechnician({
      name: 'Juan Carlos Pérez',
      phone: '+54 11 1234-5678',
      email: 'juan.perez@email.com',
      businessName: 'Pérez Refrigeración',
      serviceArea: ['CABA', 'Zona Norte']
    })
  }
})
</script>