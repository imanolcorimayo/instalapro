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
          <Icon
            name="mdi:air-conditioner"
            class="w-8 h-8 text-blue-600"
          />
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
          <Icon
            name="mdi:close"
            class="w-5 h-5"
          />
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
              <Icon
                :name="item.icon"
                class="w-5 h-5 mr-3"
              />
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Bottom section -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div class="flex items-center cursor-default">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon
                name="mdi:account"
                class="w-5 h-5 text-blue-600"
              />
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-700 truncate">
              {{ technicianName || 'Técnico' }}
            </p>
            <p class="text-xs text-gray-500">
              Back Office
            </p>
          </div>
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
          <Icon
            name="mdi:menu"
            class="w-6 h-6"
          />
        </button>

        <!-- Page title -->
        <div class="flex-1 lg:flex-none lg:ml-4">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ pageTitle }}
          </h2>
        </div>

        <!-- Right side actions -->
        <div class="flex items-center space-x-3">
          <!-- Notifications -->
          <button
            type="button"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <Icon
              name="mdi:bell-outline"
              class="w-5 h-5"
            />
          </button>

          <!-- Settings -->
          <NuxtLink
            to="/settings"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <Icon
              name="mdi:cog-outline"
              class="w-5 h-5"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- Page content -->
      <main class="p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// ==========================================
// COMPOSABLES
// ==========================================

const route = useRoute()
const technicianStore = useTechnicianStore()

// ==========================================
// STATE
// ==========================================

const isMobileMenuOpen = ref<boolean>(false)

// ==========================================
// COMPUTED
// ==========================================

const technicianName = computed(() => {
  return technicianStore.technician?.name || ''
})

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Panel Principal',
    '/setup': 'Configuración Inicial',
    '/schedule': 'Agenda',
    '/clients': 'Clientes',
    '/quotes': 'Presupuestos',
    '/cash-flow': 'Facturación',
    '/settings': 'Configuración'
  }
  
  return titles[route.path] || 'InstalarPro'
})

const navigationItems = computed(() => [
  {
    name: 'Panel Principal',
    href: '/',
    icon: 'mdi:view-dashboard-outline'
  },
  {
    name: 'Configuración',
    href: '/setup',
    icon: 'mdi:cog-outline'
  },
  {
    name: 'Agenda',
    href: '/schedule',
    icon: 'mdi:calendar-outline'
  },
  {
    name: 'Clientes',
    href: '/clients',
    icon: 'mdi:account-group-outline'
  },
  {
    name: 'Presupuestos',
    href: '/quotes',
    icon: 'mdi:file-document-outline'
  },
  {
    name: 'Facturación',
    href: '/cash-flow',
    icon: 'mdi:cash-multiple'
  }
])

// ==========================================
// METHODS
// ==========================================

const openMobileMenu = (): void => {
  isMobileMenuOpen.value = true
}

const closeMobileMenu = (): void => {
  isMobileMenuOpen.value = false
}

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  // Initialize technician store
  technicianStore.initialize()
  
  // Close mobile menu on route change
  watch(
    () => route.path,
    () => {
      closeMobileMenu()
    }
  )
})
</script>