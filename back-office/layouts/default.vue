<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile menu overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 lg:hidden"
    >
      <div
        class="fixed inset-0 bg-black bg-opacity-50"
        @click="closeMobileMenu"
      />
    </div>

    <!-- Sidebar -->
    <div
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Logo/Header -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 cursor-default">
        <div class="flex items-center">
          <IconAirConditioner class="w-8 h-8 text-blue-600" />
          <h1 class="ml-2 text-xl font-bold text-gray-800">
            InstalarPro
          </h1>
        </div>
        <button
          v-if="isMobileMenuOpen"
          type="button"
          class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          @click="closeMobileMenu"
        >
          <IconClose class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="mt-4 px-4 pb-24">
        <ul class="space-y-2">
          <li
            v-for="item in navigationItems"
            :key="item.name"
          >
            <NuxtLink
              :to="item.href"
              :class="[
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                $route.path === item.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              ]"
              @click="closeMobileMenu"
            >
              <component :is="item.component" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Bottom section -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center cursor-default min-w-0 flex-1">
            <div class="flex-shrink-0">
              <img 
                v-if="authStore.userPhoto" 
                :src="authStore.userPhoto" 
                :alt="authStore.userName" 
                class="w-10 h-10 rounded-lg"
              />
              <div v-else class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <IconAccount class="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div class="ml-3 min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-700 truncate">
                {{ authStore.userName || technicianName || 'Técnico' }}
              </p>
              <p class="text-xs text-gray-500">
                Back Office
              </p>
            </div>
          </div>
          <button
            @click.prevent="handleSignOut"
            class="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
            title="Cerrar sesión"
            type="button"
          >
            <IconLogoutVariant class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:ml-64">
      <!-- Top bar -->
      <div class="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-6 cursor-default">
        <!-- Mobile menu button -->
        <button
          type="button"
          class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          @click="openMobileMenu"
        >
          <IconMenu class="w-6 h-6" />
        </button>

        <!-- Page title -->
        <div class="flex-1 lg:flex-none lg:ml-4">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ pageTitle }}
          </h2>
        </div>

      </div>

      <!-- Page content -->
      <main class="p-4 lg:p-6">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>

    <!-- Toast Container -->
    <Teleport to="body">
      <div id="toast-container" />
    </Teleport>
  </div>
</template>

<script setup>
// Icons
import IconAirConditioner from '~icons/mdi/air-conditioner'
import IconClose from '~icons/mdi/close'
import IconAccount from '~icons/mdi/account'
import IconMenu from '~icons/mdi/menu'
import IconCogOutline from '~icons/mdi/cog-outline'
import IconViewDashboardOutline from '~icons/mdi/view-dashboard-outline'
import IconCalendarOutline from '~icons/mdi/calendar-outline'
import IconAccountGroupOutline from '~icons/mdi/account-group-outline'
import IconFileDocumentOutline from '~icons/mdi/file-document-outline'
import IconLogoutVariant from '~icons/mdi/logout-variant'

// ==========================================
// COMPOSABLES
// ==========================================

const route = useRoute()
const techniciansStore = useTechniciansStore()
const authStore = useAuthStore()
const { $toast } = useNuxtApp()

// ==========================================
// STATE
// ==========================================

const isMobileMenuOpen = ref(false)

// ==========================================
// COMPUTED
// ==========================================

const technicianName = computed(() => {
  return techniciansStore.technician?.name || ''
})

const pageTitle = computed(() => {
  const titles = {
    '/': 'Panel Principal',
    '/schedule': 'Agenda',
    '/clients': 'Clientes',
    '/quotes': 'Presupuestos',
    '/settings': 'Configuración'
  }
  
  return titles[route.path] || 'InstalarPro'
})

const navigationItems = computed(() => [
  {
    name: 'Panel Principal',
    href: '/',
    icon: 'mdi:view-dashboard-outline',
    component: IconViewDashboardOutline
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: 'mdi:cog-outline',
    component: IconCogOutline
  },
  {
    name: 'Agenda',
    href: '/schedule',
    icon: 'mdi:calendar-outline',
    component: IconCalendarOutline
  },
  {
    name: 'Clientes',
    href: '/clients',
    icon: 'mdi:account-group-outline',
    component: IconAccountGroupOutline
  },
  {
    name: 'Presupuestos',
    href: '/quotes',
    icon: 'mdi:file-document-outline',
    component: IconFileDocumentOutline
  }
])

// ==========================================
// METHODS
// ==========================================

const openMobileMenu = () => {
  isMobileMenuOpen.value = true
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    $toast.success('Sesión cerrada correctamente')
  } catch (error) {
    console.error('Sign out error:', error)
    $toast.error('Error al cerrar sesión')
  }
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  // Initialize stores
  techniciansStore.initialize()
  
  // Close mobile menu on route change
  watch(
    () => route.path,
    () => {
      closeMobileMenu()
    }
  )
})
</script>