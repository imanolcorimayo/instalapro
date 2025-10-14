<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Agenda</h1>
        <p class="text-sm text-gray-600 mt-1">
          Gestiona tus trabajos y horarios disponibles
        </p>
      </div>
      
      <button
        @click="openNewJobModal"
        class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
      >
        <IconPlus class="w-4 h-4" />
        <span class="hidden sm:inline">Nuevo Trabajo</span>
        <span class="sm:hidden">Nuevo</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="pageLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <IconLoading class="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
        <p class="text-sm text-gray-600">Cargando agenda...</p>
      </div>
    </div>

    <!-- Main Content (hidden while loading) -->
    <div v-else>
    <!-- Mode Toggle: Trabajos vs Disponibilidad -->
    <div class="flex flex-col gap-4 mb-6">
      <!-- Desktop Mode Toggle -->
      <div class="hidden sm:flex items-center justify-center">
        <div class="inline-flex bg-gray-100 rounded-xl p-1">
          <button
            @click="viewMode = 'agenda'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap',
              viewMode === 'agenda'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Trabajos
          </button>
          <button
            @click="viewMode = 'availability'"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap flex items-center gap-2',
              viewMode === 'availability'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            <IconClock class="w-4 h-4" />
            Disponibilidad
          </button>
        </div>
      </div>
      
      <!-- Mobile Mode Toggle -->
      <div class="flex gap-2 sm:hidden">
        <button
          @click="viewMode = 'agenda'"
          :class="[
            'flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out',
            viewMode === 'agenda'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          Trabajos
        </button>
        <button
          @click="viewMode = 'availability'"
          :class="[
            'flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2',
            viewMode === 'availability'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          <IconClock class="w-4 h-4" />
          Disponibilidad
        </button>
      </div>

      <!-- View Toggle Pills (Week/Day) for Agenda mode only -->
      <div v-if="viewMode === 'agenda'" class="flex items-center justify-center">
        <div class="inline-flex bg-gray-100 rounded-xl p-1 overflow-x-auto">
          <button
            @click="switchToWeeklyTimelineView"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap',
              currentView === 'weekly-timeline'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Semana
          </button>
          <button
            @click="switchToDayView()"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap',
              currentView === 'daily'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Día
          </button>
        </div>
      </div>
    </div>

    <!-- Week Navigation (only show in weekly timeline view AND agenda mode) -->
    <div v-if="viewMode === 'agenda' && currentView === 'weekly-timeline'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div class="flex items-center justify-between">
        <button
          @click="previousWeek"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IconChevronLeft class="w-5 h-5" />
        </button>
        
        <div class="text-center">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ currentWeekLabel }}
          </h2>
          <p class="text-sm text-gray-600">
            {{ currentWeekDateRange }}
          </p>
        </div>
        
        <button
          @click="nextWeek"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IconChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Day Navigation (only show in day view AND agenda mode) -->
    <div v-if="viewMode === 'agenda' && currentView === 'daily'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div class="flex items-center justify-between">
        <button
          @click="previousDay"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IconChevronLeft class="w-5 h-5" />
        </button>
        
        <div class="text-center">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ currentDayViewLabel }}
          </h2>
          <p class="text-sm text-gray-600">
            {{ isToday(currentDayView) ? 'Hoy' : '' }}
          </p>
        </div>
        
        <button
          @click="nextDay"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IconChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Weekly Timeline View (Agenda Mode) -->
    <div v-if="viewMode === 'agenda' && currentView === 'weekly-timeline'" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Mobile: Enhanced horizontal scroll view -->
      <div class="block sm:hidden relative">
        <!-- Scroll indicator text -->
        <div class="bg-blue-50 px-4 py-2 text-center border-b border-blue-200">
          <p class="text-xs text-blue-700 font-medium flex items-center justify-center gap-1">
            <IconChevronLeft class="w-3 h-3" />
            <span>Desliza para ver todos los días</span>
            <IconChevronRight class="w-3 h-3" />
          </p>
        </div>
        
        <!-- Scroll arrows -->
        <button
          v-if="canScrollLeft"
          @click="scrollMobileTimeline('left')"
          class="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full p-2 shadow-md hover:bg-white transition-all"
        >
          <IconChevronLeft class="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          v-if="canScrollRight"
          @click="scrollMobileTimeline('right')"
          class="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full p-2 shadow-md hover:bg-white transition-all"
        >
          <IconChevronRight class="w-4 h-4 text-gray-600" />
        </button>
        
        <!-- Gradient overlays -->
        <div
          v-if="canScrollLeft"
          class="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"
        ></div>
        <div
          v-if="canScrollRight"
          class="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"
        ></div>
        
        <!-- Scrollable content -->
        <div 
          ref="mobileScrollContainer"
          @scroll="updateScrollIndicators"
          class="overflow-x-auto scrollbar-hide"
        >
        <div class="min-w-[640px]">
          <!-- Header with day names and numbers -->
          <div class="flex border-b border-gray-200">
            <!-- Hour header -->
            <div class="w-12 bg-gray-50 p-2 border-r border-gray-200 flex-shrink-0">
              <div class="text-xs font-medium text-gray-600 text-center">Hora</div>
            </div>
            <!-- Day headers -->
            <div class="flex flex-1">
              <div 
                v-for="day in weekDays"
                :key="day.date"
                :class="[
                  'flex-1 p-2 border-r border-gray-100 last:border-r-0 text-center min-w-[80px]',
                  isToday(day.date) ? 'bg-blue-50' : 'bg-gray-50'
                ]"
              >
                <div :class="[
                  'text-xs font-medium mb-1',
                  isToday(day.date) ? 'text-blue-700' : 'text-gray-600'
                ]">
                  {{ day.dayName }}
                </div>
                <div :class="[
                  'text-sm font-bold',
                  isToday(day.date) ? 'text-blue-600' : 'text-gray-900'
                ]">
                  {{ day.dayNumber }}
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline grid -->
          <div class="relative">
            <!-- Hour rows -->
            <div 
              v-for="hour in workingHours"
              :key="hour"
              class="flex border-b border-gray-100 last:border-b-0 h-16"
            >
              <!-- Hour column -->
              <div class="w-12 bg-gray-50 flex items-center justify-center border-r border-gray-200 flex-shrink-0">
                <span class="text-xs font-medium text-gray-600">
                  {{ formatHour(hour) }}
                </span>
              </div>
              
              <!-- Day columns -->
              <div class="flex flex-1">
                <div 
                  v-for="day in weekDays"
                  :key="`${day.date}-${hour}`"
                  class="flex-1 border-r border-gray-100 last:border-r-0 relative min-w-[80px]"
                >
                  <!-- Empty slot click area (only if slot is available) -->
                  <div
                    v-if="getHourJobs(day.date, hour).length === 0"
                    :class="[
                      'absolute inset-0 transition-colors',
                      slotAvailabilityStore.getSlotStatus(day.date, hour) === 'available'
                        ? 'hover:bg-blue-50 cursor-pointer'
                        : 'bg-gray-100 cursor-not-allowed opacity-60'
                    ]"
                    @click="handleSlotClick(day.date, hour)"
                  >
                    <div v-if="slotAvailabilityStore.getSlotStatus(day.date, hour) === 'available'" class="flex items-center justify-center h-full">
                      <div class="w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
                    </div>
                    <div v-else class="flex items-center justify-center h-full">
                      <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Jobs overlay -->
            <div class="absolute inset-0 pointer-events-none">
              <div class="flex h-full">
                <!-- Skip hour column -->
                <div class="w-12 flex-shrink-0"></div>
                
                <!-- Day columns with jobs -->
                <div class="flex flex-1">
                  <div 
                    v-for="(day, dayIndex) in weekDays"
                    :key="day.date"
                    class="flex-1 relative min-w-[80px]"
                  >
                    <div
                      v-for="job in getDayJobs(day.date)"
                      :key="job.id"
                      :class="[
                        'absolute left-1 right-1 rounded border-l-2 p-1 cursor-pointer hover:shadow-sm transition-all pointer-events-auto',
                        getJobStatusColor(job.status)
                      ]"
                      :style="getWeeklyTimelineJobPosition(job)"
                      @click="editJob(job)"
                    >
                      <div class="text-xs font-medium text-gray-900 truncate">
                        {{ job.clientName }}
                      </div>
                      <div class="text-xs text-gray-600 truncate">
                        {{ job.serviceType }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Desktop: Full timeline view -->
      <div class="hidden sm:block">
        <!-- Header with day names and numbers -->
        <div class="flex border-b border-gray-200">
          <!-- Hour header -->
          <div class="w-16 bg-gray-50 p-3 border-r border-gray-200 flex-shrink-0">
            <div class="text-sm font-medium text-gray-700 text-center">Hora</div>
          </div>
          <!-- Day headers -->
          <div class="flex flex-1">
            <div 
              v-for="day in weekDays"
              :key="day.date"
              :class="[
                'flex-1 p-3 border-r border-gray-100 last:border-r-0 text-center cursor-pointer hover:bg-gray-100 transition-colors',
                isToday(day.date) ? 'bg-blue-50' : 'bg-gray-50'
              ]"
              @click="switchToDayView(day.date)"
            >
              <div :class="[
                'text-sm font-medium mb-1',
                isToday(day.date) ? 'text-blue-700' : 'text-gray-600'
              ]">
                {{ day.dayName }}
              </div>
              <div :class="[
                'text-lg font-bold',
                isToday(day.date) ? 'text-blue-600' : 'text-gray-900'
              ]">
                {{ day.dayNumber }}
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline grid -->
        <div class="relative">
          <!-- Hour rows -->
          <div 
            v-for="hour in workingHours"
            :key="hour"
            class="flex border-b border-gray-100 last:border-b-0 h-16"
          >
            <!-- Hour column -->
            <div class="w-16 bg-gray-50 flex items-center justify-center border-r border-gray-200 flex-shrink-0">
              <span class="text-sm font-medium text-gray-600">
                {{ formatHour(hour) }}
              </span>
            </div>
            
            <!-- Day columns -->
            <div class="flex flex-1">
              <div 
                v-for="day in weekDays"
                :key="`${day.date}-${hour}`"
                class="flex-1 border-r border-gray-100 last:border-r-0 relative"
              >
                <!-- Empty slot click area (only if slot is available) -->
                <div
                  v-if="getHourJobs(day.date, hour).length === 0"
                  :class="[
                    'absolute inset-0 transition-colors flex items-center justify-center',
                    slotAvailabilityStore.getSlotStatus(day.date, hour) === 'available'
                      ? 'hover:bg-blue-50 cursor-pointer'
                      : 'bg-gray-100 cursor-not-allowed opacity-60'
                  ]"
                  @click="handleSlotClick(day.date, hour)"
                >
                  <div v-if="slotAvailabilityStore.getSlotStatus(day.date, hour) === 'available'" class="flex items-center justify-center">
                    <div class="w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
                    <span class="text-xs text-gray-400 opacity-0 hover:opacity-100 transition-opacity ml-2">
                      +
                    </span>
                  </div>
                  <div v-else class="flex items-center justify-center">
                    <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Jobs overlay -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="flex h-full">
              <!-- Skip hour column -->
              <div class="w-16 flex-shrink-0"></div>
              
              <!-- Day columns with jobs -->
              <div class="flex flex-1">
                <div 
                  v-for="(day, dayIndex) in weekDays"
                  :key="day.date"
                  class="flex-1 relative"
                >
                  <div
                    v-for="job in getDayJobs(day.date)"
                    :key="job.id"
                    :class="[
                      'absolute left-2 right-2 rounded border-l-4 p-2 cursor-pointer hover:shadow-sm transition-all pointer-events-auto',
                      getJobStatusColor(job.status)
                    ]"
                    :style="getWeeklyTimelineJobPosition(job)"
                    @click="editJob(job)"
                  >
                    <div class="text-sm font-medium text-gray-900 truncate">
                      {{ job.clientName }}
                    </div>
                    <div class="text-xs text-gray-600 truncate">
                      {{ job.serviceType }}
                    </div>
                    <div class="text-xs text-gray-500">
                      ${{ job.price?.toLocaleString() || 0 }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day View (Agenda Mode) -->
    <div v-if="viewMode === 'agenda' && currentView === 'daily'" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Timeline view for all screen sizes -->
      <div>
        <!-- Day Timeline with Hours -->
        <div class="border border-gray-200 rounded-lg overflow-hidden relative">
          <!-- Hour rows background -->
          <div
            v-for="hour in workingHours"
            :key="hour"
            class="border-b border-gray-100 last:border-b-0 h-16"
          >
            <div class="flex h-full">
              <!-- Hour Column -->
              <div class="w-12 sm:w-16 bg-gray-50 flex items-center justify-center border-r border-gray-100 flex-shrink-0">
                <span class="text-xs font-medium text-gray-600">
                  {{ formatHour(hour) }}
                </span>
              </div>
              
              <!-- Job Slot -->
              <div class="flex-1 relative">
                <!-- Empty slot click area (only if slot is available) -->
                <div
                  v-if="getHourJobs(currentDayView, hour).length === 0"
                  :class="[
                    'absolute inset-0 transition-colors flex items-center pl-2 sm:pl-3',
                    slotAvailabilityStore.getSlotStatus(currentDayView, hour) === 'available'
                      ? 'hover:bg-blue-50 cursor-pointer'
                      : 'bg-gray-100 cursor-not-allowed opacity-60'
                  ]"
                  @click="handleSlotClick(currentDayView, hour)"
                >
                  <div v-if="slotAvailabilityStore.getSlotStatus(currentDayView, hour) === 'available'" class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span class="text-xs text-gray-500">Click para agendar</span>
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span class="text-xs text-gray-400">No disponible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Jobs overlay with proper positioning -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="relative h-full">
              <!-- Left margin for hour column -->
              <div class="ml-12 sm:ml-16 h-full relative">
                <div
                  v-for="job in getDayJobs(currentDayView)"
                  :key="job.id"
                  :class="[
                    'absolute left-1 right-1 sm:left-2 sm:right-2 rounded border-l-4 p-1 sm:p-2 cursor-pointer hover:shadow-sm transition-all pointer-events-auto',
                    getJobStatusColor(job.status)
                  ]"
                  :style="getDayViewJobPosition(job)"
                  @click="editJob(job)"
                >
                  <div class="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {{ job.clientName }}
                  </div>
                  <div class="text-xs text-gray-600 truncate">
                    {{ job.serviceType }}
                  </div>
                  <div class="text-xs text-gray-500 hidden sm:block">
                    ${{ job.price?.toLocaleString() || 0 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Availability Configuration View -->
    <div v-if="viewMode === 'availability'" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Week Navigation -->
      <div class="bg-white rounded-lg border-b border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <button
            @click="previousWeek"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IconChevronLeft class="w-5 h-5" />
          </button>
          
          <div class="text-center">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ currentWeekLabel }}
            </h2>
            <p class="text-sm text-gray-600">
              {{ currentWeekDateRange }}
            </p>
          </div>
          
          <button
            @click="nextWeek"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IconChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="overflow-auto">
        <div class="min-w-[800px]">
          <!-- Days Header -->
          <div class="flex border-b border-gray-200">
            <!-- Hour header -->
            <div class="w-16 bg-gray-50 p-3 border-r border-gray-200 flex-shrink-0">
              <div class="text-sm font-medium text-gray-700 text-center">Hora</div>
            </div>
            <!-- Day headers -->
            <div class="flex flex-1">
              <div 
                v-for="day in weekDays"
                :key="day.date"
                :class="[
                  'flex-1 p-3 border-r border-gray-100 last:border-r-0 text-center',
                  isToday(day.date) ? 'bg-blue-50' : 'bg-gray-50'
                ]"
              >
                <div :class="[
                  'text-sm font-medium mb-1',
                  isToday(day.date) ? 'text-blue-700' : 'text-gray-600'
                ]">
                  {{ day.dayName }}
                </div>
                <div :class="[
                  'text-lg font-bold mb-2',
                  isToday(day.date) ? 'text-blue-600' : 'text-gray-900'
                ]">
                  {{ day.dayNumber }}
                </div>
                <!-- Open All Day Button -->
                <button
                  @click="openAllDay(day.date)"
                  :disabled="slotAvailabilityStore.loading"
                  :class="[
                    'px-3 py-1 text-xs font-medium rounded transition-colors',
                    isDayFullyOpen(day.date)
                      ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white'
                      : 'bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white'
                  ]"
                  :title="`${isDayFullyOpen(day.date) ? 'Cerrar' : 'Abrir'} todo el día ${day.dayName}`"
                >
                  {{ isDayFullyOpen(day.date) ? 'Cerrar' : 'Abrir' }} Todo
                </button>
              </div>
            </div>
          </div>

          <!-- Time slots grid -->
          <div class="divide-y">
            <div 
              v-for="hour in availableHours"
              :key="hour"
              class="flex min-h-[60px]"
            >
              <!-- Hour column -->
              <div class="w-16 bg-gray-50 flex items-center justify-center border-r border-gray-200 flex-shrink-0">
                <span class="text-sm font-medium text-gray-600">
                  {{ formatHour(hour) }}
                </span>
              </div>
              
              <!-- Day columns -->
              <div class="flex flex-1">
                <div 
                  v-for="day in weekDays"
                  :key="`${day.date}-${hour}`"
                  class="flex-1 border-r border-gray-100 last:border-r-0 p-2 relative hover:bg-gray-50"
                >
                  <div class="flex items-center justify-center h-full">
                    <!-- Toggle Switch for Slot Availability -->
                    <label class="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        :checked="slotAvailabilityStore.getSlotStatus(day.date, hour) === 'available'"
                        :disabled="slotAvailabilityStore.getSlotStatus(day.date, hour) === 'auto_closed' || slotAvailabilityStore.loading"
                        @change="toggleSlot(day.date, hour)"
                        class="sr-only"
                      />
                      <div 
                        :class="[
                          'relative w-9 h-5 rounded-full transition-colors duration-300 ease-in-out',
                          slotAvailabilityStore.getSlotStatus(day.date, hour) === 'available'
                            ? 'bg-green-500'
                            : slotAvailabilityStore.getSlotStatus(day.date, hour) === 'auto_closed'
                            ? 'bg-red-400 cursor-not-allowed'
                            : 'bg-gray-300',
                          slotAvailabilityStore.loading ? 'opacity-50 cursor-not-allowed' : ''
                        ]"
                      >
                        <div 
                          :class="[
                            'absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow transition-transform duration-300 ease-in-out',
                            slotAvailabilityStore.getSlotStatus(day.date, hour) === 'available'
                              ? 'translate-x-4'
                              : 'translate-x-0'
                          ]"
                        />
                      </div>
                    </label>
                    <!-- Status indicator for auto-closed slots -->
                    <div v-if="slotAvailabilityStore.getSlotStatus(day.date, hour) === 'auto_closed'" class="ml-2">
                      <IconClock class="w-3 h-3 text-red-500" title="Ocupado (trabajo programado)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="bg-gray-50 border-t border-gray-200 p-4">
        <div class="flex items-center justify-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-green-500 rounded-full"></div>
            <span class="text-sm text-gray-600">Disponible</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-gray-300 rounded-full"></div>
            <span class="text-sm text-gray-600">No disponible</span>
          </div>
        </div>
      </div>
    </div>
    </div>
    <!-- End Main Content -->

    <!-- Job Form Modal -->
    <ModalStructure
      ref="jobModal"
      :title="editingJob ? 'Editar Trabajo' : 'Nuevo Trabajo'"
      @on-close="resetJobForm"
    >
      <!-- Status Pills (only when editing) -->
      <div v-if="editingJob" class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-700">Estado del Trabajo</h3>
          <div v-if="isJobInFuture" class="flex items-center gap-1 text-xs text-amber-600">
            <IconAlertCircle class="w-3 h-3" />
            <span>Trabajo futuro</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <!-- Pendiente -->
          <button
            type="button"
            @click="jobForm.status = 'pending'"
            :class="[
              'flex items-center justify-center gap-2 px-4 py-3 sm:px-3 sm:py-2 rounded-lg font-medium text-sm transition-all touch-manipulation',
              jobForm.status === 'pending' 
                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 shadow-sm' 
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
            ]"
          >
            <IconClock class="w-5 h-5 sm:w-4 sm:h-4" />
            <span>Pendiente</span>
          </button>
          
          <!-- Confirmado -->
          <button
            type="button"
            @click="jobForm.status = 'confirmed'"
            :class="[
              'flex items-center justify-center gap-2 px-4 py-3 sm:px-3 sm:py-2 rounded-lg font-medium text-sm transition-all touch-manipulation',
              jobForm.status === 'confirmed' 
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-sm' 
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            ]"
          >
            <IconCalendarCheck class="w-5 h-5 sm:w-4 sm:h-4" />
            <span>Confirmado</span>
          </button>
          
          <!-- En Progreso -->
          <button
            type="button"
            @click="!isJobInFuture && (jobForm.status = 'in_progress')"
            :disabled="isJobInFuture"
            :class="[
              'flex items-center justify-center gap-2 px-4 py-3 sm:px-3 sm:py-2 rounded-lg font-medium text-sm transition-all touch-manipulation',
              isJobInFuture 
                ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                : jobForm.status === 'in_progress' 
                  ? 'bg-orange-100 text-orange-800 border-2 border-orange-300 shadow-sm' 
                  : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
            ]"
          >
            <IconProgressClock class="w-5 h-5 sm:w-4 sm:h-4" />
            <span>En Progreso</span>
          </button>
          
          <!-- Completado -->
          <button
            type="button"
            @click="!isJobInFuture && (jobForm.status = 'completed')"
            :disabled="isJobInFuture"
            :class="[
              'flex items-center justify-center gap-2 px-4 py-3 sm:px-3 sm:py-2 rounded-lg font-medium text-sm transition-all touch-manipulation',
              isJobInFuture 
                ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                : jobForm.status === 'completed' 
                  ? 'bg-green-100 text-green-800 border-2 border-green-300 shadow-sm' 
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
            ]"
          >
            <IconCheckCircle class="w-5 h-5 sm:w-4 sm:h-4" />
            <span>Completado</span>
          </button>
          
          <!-- Cancelado -->
          <button
            type="button"
            @click="jobForm.status = 'cancelled'"
            :class="[
              'flex items-center justify-center gap-2 px-4 py-3 sm:px-3 sm:py-2 rounded-lg font-medium text-sm transition-all touch-manipulation col-span-2 sm:col-span-1',
              jobForm.status === 'cancelled' 
                ? 'bg-red-100 text-red-800 border-2 border-red-300 shadow-sm' 
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            ]"
          >
            <IconCancel class="w-5 h-5 sm:w-4 sm:h-4" />
            <span>Cancelado</span>
          </button>
        </div>
        
        <!-- Future job warning -->
        <div v-if="isJobInFuture && (jobForm.status === 'completed' || jobForm.status === 'in_progress')" 
             class="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
          <div class="flex items-start gap-2">
            <IconAlertCircle class="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
            <div>
              <p class="text-sm font-medium text-amber-800">
                Restricción de Estado
              </p>
              <p class="text-sm text-amber-700 mt-1">
                <span v-if="jobForm.status === 'completed'">
                  No se puede marcar como "Completado" un trabajo programado para el futuro
                </span>
                <span v-else-if="jobForm.status === 'in_progress'">
                  No se puede marcar como "En Progreso" un trabajo programado para el futuro
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <form @submit.prevent="saveJob" class="space-y-4">
        <!-- Client Name with Auto-complete -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <input
            :value="clientSearchQuery"
            @input="handleClientNameInput"
            @focus="clientSearchQuery.trim() && (showClientDropdown = true)"
            @blur="handleClientNameBlur"
            @keydown="handleClientInputKeydown"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar cliente o escribir nombre nuevo"
            autocomplete="off"
          />
          
          <!-- Auto-complete Dropdown -->
          <div
            v-if="showClientDropdown && (filteredClients.length > 0 || !hasExactClientMatch)"
            class="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1 sm:max-h-48"
          >
            <!-- Existing clients -->
            <div
              v-for="(client, index) in filteredClients"
              :key="client.id"
              @click="selectClient(client)"
              :class="[
                'p-3 sm:p-2 cursor-pointer border-b border-gray-100 last:border-b-0 touch-manipulation',
                index === highlightedClientIndex 
                  ? 'bg-blue-100 border-blue-200' 
                  : 'hover:bg-blue-50 active:bg-blue-100'
              ]"
            >
              <div class="font-medium text-gray-900">{{ client.name }}</div>
              <div class="text-sm text-gray-600">{{ client.phone }}</div>
              <div class="text-xs text-gray-500 truncate">{{ client.address }}</div>
            </div>
            
            <!-- Create new client option -->
            <div
              v-if="clientSearchQuery.trim() && !hasExactClientMatch"
              @click="createNewClient"
              :class="[
                'p-3 sm:p-2 cursor-pointer border-t border-gray-200 bg-green-25 touch-manipulation',
                highlightedClientIndex === filteredClients.length 
                  ? 'bg-green-100 border-green-200' 
                  : 'hover:bg-green-50 active:bg-green-100'
              ]"
            >
              <div class="flex items-center gap-2 font-medium text-green-700">
                <IconPlus class="w-4 h-4" />
                Crear cliente "{{ clientSearchQuery.trim() }}"
              </div>
              <div class="text-sm text-green-600">Click para agregar como nuevo cliente</div>
            </div>
          </div>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            v-model="jobForm.clientPhone"
            type="tel"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+54 11 1234-5678"
          />
        </div>

        <!-- Service Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Servicio *
          </label>
          <select
            v-model="jobForm.serviceType"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="onServiceTypeChange"
          >
            <option value="">Seleccionar servicio</option>
            <option 
              v-for="service in serviceTypesStore.activeServiceTypes" 
              :key="service.id" 
              :value="service.name"
            >
              {{ service.name }} - ${{ service.basePrice.toLocaleString() }}
            </option>
          </select>
          <p v-if="selectedServiceType" class="text-xs text-gray-500 mt-1">
            Duración estimada: {{ Math.round(selectedServiceType.estimatedDuration / 60) }}h {{ selectedServiceType.estimatedDuration % 60 }}min
          </p>
        </div>

        <!-- Date and Time -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              v-model="jobForm.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Hora *
            </label>
            <input
              v-model="jobForm.time"
              type="time"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Duration -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Duración (minutos) *
          </label>
          <input
            v-model="jobForm.duration"
            type="number"
            min="15"
            max="480"
            step="15"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="120"
          />
          <p class="text-xs text-gray-500 mt-1">
            Entre 15 minutos y 8 horas ({{ Math.round((jobForm.duration || 0) / 60) }}h {{ (jobForm.duration || 0) % 60 }}min)
          </p>
        </div>

        <!-- Address -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Dirección *
          </label>
          <textarea
            v-model="jobForm.address"
            required
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dirección completa del trabajo"
          />
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Precio
          </label>
          <input
            v-model="jobForm.price"
            type="number"
            min="0"
            step="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            v-model="jobForm.notes"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionales..."
          />
        </div>


        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="closeJobModal"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            v-if="editingJob"
            type="button"
            @click="deleteJob"
            class="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
          >
            Eliminar
          </button>
          <button
            type="submit"
            :disabled="savingJob"
            class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
          >
            <IconLoading 
              v-if="savingJob" 
              class="w-4 h-4 animate-spin" 
            />
            {{ editingJob ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </form>
    </ModalStructure>

    <!-- Client Creation Modal -->
    <ClientModal
      ref="clientModalRef"
      :initial-name="clientSearchQuery"
      @client-created="handleClientCreated"
    />
  </div>
</template>

<script setup>
import IconPlus from '~icons/mdi/plus'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconChevronRight from '~icons/mdi/chevron-right'
import IconLoading from '~icons/mdi/loading'
import IconClock from '~icons/mdi/clock-outline'
import IconCalendarCheck from '~icons/mdi/calendar-check'
import IconProgressClock from '~icons/mdi/progress-clock'
import IconCheckCircle from '~icons/mdi/check-circle'
import IconCancel from '~icons/mdi/cancel'
import IconAlertCircle from '~icons/mdi/alert-circle'
import { 
  nowInBuenosAires, 
  toBuenosAires, 
  isTodayInBuenosAires,
  startOfWeekInBuenosAires,
  endOfWeekInBuenosAires
} from '~/utils/timezone'

import { watch, nextTick, onBeforeUnmount } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Agenda - InstalarPro Back Office',
  description: 'Gestione su agenda de trabajos y citas programadas.',
  robots: 'noindex, nofollow'
})

// Store integration
const jobsStore = useJobsStore()
const clientsStore = useClientsStore()
const slotAvailabilityStore = useSlotAvailabilityStore()

// Service types store
const serviceTypesStore = useServiceTypesStore()

// Component state
const currentWeekStart = ref(startOfWeekInBuenosAires())
const editingJob = ref(null)
const savingJob = ref(false)
const pageLoading = ref(true)

// Mobile scroll state for weekly timeline
const mobileScrollContainer = ref()
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// View state
const currentView = ref('weekly-timeline') // 'weekly-timeline' or 'daily'
const currentDayView = ref(nowInBuenosAires().format('YYYY-MM-DD'))
const viewMode = ref('agenda') // 'agenda' or 'availability'

// Client auto-complete state
const showClientDropdown = ref(false)
const clientSearchQuery = ref('')
const selectedClient = ref(null)
const highlightedClientIndex = ref(-1)

// Modal refs
const jobModal = ref()
const clientModalRef = ref()

// Form data
const jobForm = ref({
  clientName: '',
  clientPhone: '',
  serviceType: '',
  date: '',
  time: '',
  duration: '120',
  address: '',
  price: '',
  notes: '',
  status: 'pending'
})

// Computed
const currentWeekEnd = computed(() => {
  return endOfWeekInBuenosAires(currentWeekStart.value)
})

const currentWeekDateRange = computed(() => {
  const start = currentWeekStart.value
  const end = currentWeekEnd.value
  return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`
})

const currentWeekLabel = computed(() => {
  const start = currentWeekStart.value
  const now = nowInBuenosAires()
  
  if (start.isSame(now, 'week')) {
    return 'Esta Semana'
  } else if (start.isSame(now.add(1, 'week'), 'week')) {
    return 'Próxima Semana'
  } else if (start.isSame(now.subtract(1, 'week'), 'week')) {
    return 'Semana Pasada'
  }
  
  return `Semana del ${start.format('D MMM')}`
})

const weekDays = computed(() => {
  const days = []
  const startOfWeek = currentWeekStart.value
  
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.add(i, 'day')
    days.push({
      date: date.format('YYYY-MM-DD'),
      dayName: date.format('ddd').charAt(0).toUpperCase() + date.format('ddd').slice(1),
      dayNumber: date.format('D')
    })
  }
  
  return days
})

const workingHours = computed(() => {
  const hours = []
  for (let i = 6; i <= 22; i++) {
    hours.push(i)
  }
  return hours
})

const availableHours = computed(() => {
  const hours = []
  for (let i = 6; i <= 22; i++) {
    hours.push(i)
  }
  return hours
})


const currentDayViewLabel = computed(() => {
  const formatted = toBuenosAires(currentDayView.value).format('dddd, D [de] MMMM YYYY')
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
})

// Check if the current job is in the future (prevent marking as completed)
const isJobInFuture = computed(() => {
  if (!editingJob.value) return false
  return jobsStore.isJobInFuture(editingJob.value)
})

// Client auto-complete computed
const filteredClients = computed(() => {
  if (!clientSearchQuery.value.trim()) return []
  
  const query = clientSearchQuery.value.toLowerCase().trim()
  return clientsStore.activeClients.filter(client =>
    client.name.toLowerCase().includes(query) ||
    client.phone.includes(query)
  ).slice(0, 5) // Limit to 5 results for better UX
})

const hasExactClientMatch = computed(() => {
  if (!clientSearchQuery.value.trim()) return false
  
  const query = clientSearchQuery.value.toLowerCase().trim()
  return clientsStore.activeClients.some(client =>
    client.name.toLowerCase() === query
  )
})

const selectedServiceType = computed(() => {
  if (!jobForm.value.serviceType) return null
  return serviceTypesStore.getServiceByName(jobForm.value.serviceType)
})

// Helper to check if a status is valid for future jobs
const isValidFutureJobStatus = (status) => {
  return ['pending', 'confirmed', 'cancelled'].includes(status)
}

// Watch for invalid future job status changes to provide feedback
watch(() => jobForm.value.status, (newStatus) => {
  if (isJobInFuture.value && !isValidFutureJobStatus(newStatus)) {
    // Show toast notification for better user feedback
    // The UI already prevents the selection, but this handles edge cases
    console.warn('Invalid status for future job:', newStatus)
  }
})

// Mobile scroll methods
const updateScrollIndicators = () => {
  if (!mobileScrollContainer.value) return
  
  const container = mobileScrollContainer.value
  canScrollLeft.value = container.scrollLeft > 0
  canScrollRight.value = container.scrollLeft < (container.scrollWidth - container.clientWidth - 1)
}

const scrollMobileTimeline = (direction) => {
  if (!mobileScrollContainer.value) return
  
  const container = mobileScrollContainer.value
  const scrollAmount = direction === 'left' ? -200 : 200
  
  container.scrollTo({
    left: container.scrollLeft + scrollAmount,
    behavior: 'smooth'
  })
}

// Methods
const isToday = (date) => {
  return isTodayInBuenosAires(date)
}

const previousWeek = async () => {
  currentWeekStart.value = currentWeekStart.value.subtract(1, 'week')
  // Load slots for the new week
  if (viewMode.value === 'availability') {
    try {
      await slotAvailabilityStore.loadWeekSlots(currentWeekStart.value)
    } catch (error) {
      console.error('Error loading previous week slots:', error)
      useToast().error('Error al cargar semana anterior')
    }
  }
}

const nextWeek = async () => {
  currentWeekStart.value = currentWeekStart.value.add(1, 'week')
  // Load slots for the new week
  if (viewMode.value === 'availability') {
    try {
      await slotAvailabilityStore.loadWeekSlots(currentWeekStart.value)
    } catch (error) {
      console.error('Error loading next week slots:', error)
      useToast().error('Error al cargar semana siguiente')
    }
  }
}

// Day view navigation
const previousDay = () => {
  currentDayView.value = toBuenosAires(currentDayView.value).subtract(1, 'day').format('YYYY-MM-DD')
}

const nextDay = () => {
  currentDayView.value = toBuenosAires(currentDayView.value).add(1, 'day').format('YYYY-MM-DD')
}

// View switching
const switchToWeeklyTimelineView = () => {
  currentView.value = 'weekly-timeline'
}

const switchToDayView = (date = null) => {
  currentView.value = 'daily'
  if (date) {
    currentDayView.value = date
  }
}

// Use store method for getting day jobs
const getDayJobs = (date) => {
  return jobsStore.getDayJobs(date)
}

// Use store method for getting hour jobs
const getHourJobs = (date, hour) => {
  return jobsStore.getHourJobs(date, hour)
}

// Use store method for formatting job time
const formatJobTime = (scheduledDate, duration) => {
  return jobsStore.formatJobTime(scheduledDate, duration)
}

const formatHour = (hour) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

// Use store method for job status colors
const getJobStatusColor = (status) => {
  return jobsStore.getJobStatusColor(status)
}


// Use store method for day view positioning
const getDayViewJobPosition = (job) => {
  return jobsStore.getDayViewJobPosition(job)
}

// Use store method for weekly timeline positioning
const getWeeklyTimelineJobPosition = (job) => {
  return jobsStore.getWeeklyTimelineJobPosition(job)
}

// Modal actions

const openNewJobModal = () => {
  editingJob.value = null
  selectedClient.value = null
  clientSearchQuery.value = ''
  showClientDropdown.value = false
  highlightedClientIndex.value = -1
  jobForm.value = {
    clientName: '',
    clientPhone: '',
    serviceType: '',
    date: nowInBuenosAires().format('YYYY-MM-DD'),
    time: '09:00',
    duration: '120',
    address: '',
    price: '',
    notes: '',
    status: 'pending'
  }
  jobModal.value?.showModal()
}

const editJob = (job) => {
  editingJob.value = job
  
  // Find matching client for auto-complete
  const matchingClient = clientsStore.activeClients.find(client => 
    client.name.toLowerCase() === job.clientName.toLowerCase() ||
    client.phone === job.clientPhone
  )
  
  selectedClient.value = matchingClient || null
  clientSearchQuery.value = job.clientName
  showClientDropdown.value = false
  highlightedClientIndex.value = -1
  
  const actualDate = job.scheduledDate.toDate ? job.scheduledDate.toDate() : job.scheduledDate
  const jobDate = toBuenosAires(actualDate)
  jobForm.value = {
    clientName: job.clientName,
    clientPhone: job.clientPhone,
    serviceType: job.serviceType,
    date: jobDate.format('YYYY-MM-DD'),
    time: jobDate.format('HH:mm'),
    duration: job.estimatedDuration.toString(),
    address: job.address,
    price: job.price?.toString() || '',
    notes: job.notes || '',
    status: job.status
  }
  jobModal.value?.showModal()
}

const createJobAtTime = (date, hour) => {
  editingJob.value = null
  selectedClient.value = null
  clientSearchQuery.value = ''
  showClientDropdown.value = false
  highlightedClientIndex.value = -1
  jobForm.value = {
    clientName: '',
    clientPhone: '',
    serviceType: '',
    date: date,
    time: `${hour.toString().padStart(2, '0')}:00`,
    duration: '120',
    address: '',
    price: '',
    notes: '',
    status: 'pending'
  }
  jobModal.value?.showModal()
}

// Handle slot click in agenda mode (only allow if slot is available)
const handleSlotClick = (date, hour) => {
  if (slotAvailabilityStore.getSlotStatus(date, hour) === 'available') {
    createJobAtTime(date, hour)
  } else {
    useToast().error('Este horario no está disponible para reservar')
  }
}

// Toggle slot availability (for availability mode)
const toggleSlot = async (date, hour) => {
  const status = slotAvailabilityStore.getSlotStatus(date, hour)
  
  // Prevent toggling auto-closed slots
  if (status === 'auto_closed') {
    useToast().error('No se puede modificar un horario ocupado por un trabajo')
    return
  }
  
  try {
    await slotAvailabilityStore.toggleSlotAvailability(date, hour)
    
    // Show success feedback
    const newStatus = slotAvailabilityStore.getSlotStatus(date, hour)
    const message = newStatus === 'available' 
      ? 'Horario marcado como disponible' 
      : 'Horario marcado como no disponible'
    
    useToast().success(message)
  } catch (error) {
    console.error('Error toggling slot availability:', error)
    useToast().error('Error al cambiar disponibilidad del horario')
  }
}

// Toggle all day slots (open or close)
const openAllDay = async (date) => {
  try {
    const isFullyOpen = isDayFullyOpen(date)

    if (isFullyOpen) {
      // Close all slots for the day
      await slotAvailabilityStore.closeAllSlotsForDay(date)

      // Get day name for the message
      const dayObj = weekDays.value.find(d => d.date === date)
      const dayName = dayObj ? dayObj.dayName : 'el día'

      useToast().success(`Todos los horarios de ${dayName} han sido cerrados`)
    } else {
      // Open all slots for the day
      await slotAvailabilityStore.openAllSlotsForDay(date)

      // Get day name for the message
      const dayObj = weekDays.value.find(d => d.date === date)
      const dayName = dayObj ? dayObj.dayName : 'el día'

      useToast().success(`Todos los horarios de ${dayName} han sido abiertos`)
    }
  } catch (error) {
    console.error('Error toggling all day slots:', error)
    useToast().error('Error al cambiar disponibilidad del día')
  }
}

// Check if all slots of a day are available
const isDayFullyOpen = (date) => {
  const daySlots = availableHours.value
  return daySlots.every(hour => 
    slotAvailabilityStore.getSlotStatus(date, hour) === 'available'
  )
}

const resetJobForm = () => {
  editingJob.value = null
  selectedClient.value = null
  clientSearchQuery.value = ''
  showClientDropdown.value = false
  highlightedClientIndex.value = -1
  jobForm.value = {
    clientName: '',
    clientPhone: '',
    serviceType: '',
    date: '',
    time: '',
    duration: '120',
    address: '',
    price: '',
    notes: '',
    status: 'pending'
  }
}

const closeJobModal = () => {
  jobModal.value?.closeModal()
}

// Client auto-complete methods
const handleClientNameInput = (event) => {
  const value = event.target.value
  clientSearchQuery.value = value
  jobForm.value.clientName = value
  
  // Reset highlighted index when typing
  highlightedClientIndex.value = -1
  
  if (value.trim().length > 0) {
    showClientDropdown.value = true
  } else {
    showClientDropdown.value = false
    selectedClient.value = null
    // Clear auto-filled fields when name is cleared
    if (!editingJob.value) {
      jobForm.value.clientPhone = ''
      jobForm.value.address = ''
    }
  }
}

const selectClient = (client) => {
  selectedClient.value = client
  clientSearchQuery.value = client.name
  showClientDropdown.value = false
  highlightedClientIndex.value = -1
  
  // Auto-fill form fields
  jobForm.value.clientName = client.name
  jobForm.value.clientPhone = client.phone
  jobForm.value.address = client.address
}

const createNewClient = () => {
  showClientDropdown.value = false
  highlightedClientIndex.value = -1
  // Use nextTick to ensure modal is in DOM before showing
  nextTick(() => {
    clientModalRef.value?.showModal()
  })
}

const handleClientNameBlur = () => {
  // Use setTimeout to allow click events on dropdown items to fire first
  setTimeout(() => {
    showClientDropdown.value = false
    highlightedClientIndex.value = -1
  }, 150)
}

// Handle keyboard navigation in client dropdown
const handleClientInputKeydown = (event) => {
  if (!showClientDropdown.value) return
  
  const totalOptions = filteredClients.value.length + (clientSearchQuery.value.trim() && !hasExactClientMatch.value ? 1 : 0)
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedClientIndex.value = highlightedClientIndex.value < totalOptions - 1 
        ? highlightedClientIndex.value + 1 
        : 0
      break
      
    case 'ArrowUp':
      event.preventDefault()
      highlightedClientIndex.value = highlightedClientIndex.value > 0 
        ? highlightedClientIndex.value - 1 
        : totalOptions - 1
      break
      
    case 'Enter':
      event.preventDefault()
      if (highlightedClientIndex.value >= 0) {
        if (highlightedClientIndex.value < filteredClients.value.length) {
          // Select existing client
          selectClient(filteredClients.value[highlightedClientIndex.value])
        } else {
          // Create new client
          createNewClient()
        }
      }
      break
      
    case 'Escape':
      event.preventDefault()
      showClientDropdown.value = false
      highlightedClientIndex.value = -1
      break
  }
}

const closeClientModal = () => {
  clientModalRef.value?.closeModal()
}

const handleClientCreated = (newClient) => {
  // Auto-select the newly created client (modal closes automatically)
  selectedClient.value = newClient
  clientSearchQuery.value = newClient.name
  
  // Auto-fill form fields
  jobForm.value.clientName = newClient.name
  jobForm.value.clientPhone = newClient.phone
  jobForm.value.address = newClient.address
  
  // Note: No need to reload clients as the store is automatically updated
}

const onServiceTypeChange = () => {
  const service = selectedServiceType.value
  if (service) {
    // Auto-fill price and duration based on selected service
    jobForm.value.price = service.basePrice.toString()
    jobForm.value.duration = service.estimatedDuration.toString()
  }
}

// Use store method for time overlap checking
const checkTimeOverlap = (newJobStart, newJobDuration, excludeJobId = null) => {
  return jobsStore.checkTimeOverlap(newJobStart, newJobDuration, excludeJobId)
}

const saveJob = async () => {
  try {
    savingJob.value = true
    
    // Prevent marking future jobs as completed
    if (jobForm.value.status === 'completed' && isJobInFuture.value) {
      useToast().error('No se puede marcar como completado un trabajo programado para el futuro')
      savingJob.value = false
      return
    }

    // Combine date and time
    const scheduledDateTime = toBuenosAires(`${jobForm.value.date} ${jobForm.value.time}`)
    const durationMinutes = parseInt(jobForm.value.duration)

    // Check slot availability (only for NEW jobs, not editing)
    if (!editingJob.value) {
      const hour = scheduledDateTime.hour()
      const slotStatus = slotAvailabilityStore.getSlotStatus(jobForm.value.date, hour)

      if (slotStatus !== 'available') {
        useToast().error('Este horario no está disponible. Configure la disponibilidad en la pestaña "Disponibilidad" primero.')
        savingJob.value = false
        return
      }
    }
    
    // Check for time overlap
    const overlapCheck = checkTimeOverlap(
      scheduledDateTime.toDate(), 
      durationMinutes, 
      editingJob.value?.id
    )
    
    if (overlapCheck.hasOverlap) {
      useToast().error(
        `Conflicto de horario con "${overlapCheck.conflictJob.clientName}" (${overlapCheck.conflictTime})`
      )
      savingJob.value = false
      return
    }
    
    const jobData = {
      clientName: jobForm.value.clientName.trim(),
      clientPhone: jobForm.value.clientPhone.trim(),
      serviceType: jobForm.value.serviceType,
      scheduledDate: scheduledDateTime.toDate(),
      estimatedDuration: durationMinutes,
      address: jobForm.value.address.trim(),
      price: jobForm.value.price ? parseFloat(jobForm.value.price) : 0,
      notes: jobForm.value.notes.trim(),
      status: jobForm.value.status,
      clientId: selectedClient.value?.id || ''
    }

    if (editingJob.value) {
      const oldJob = editingJob.value
      await jobsStore.updateJob(editingJob.value.id, jobData)
      
      // Update client stats if job status changed
      if (selectedClient.value) {
        await updateClientStatsFromJob(selectedClient.value.id, jobData, oldJob)
      }
      
      useToast().success('Trabajo actualizado exitosamente')
    } else {
      await jobsStore.createJob(jobData)
      
      // Update client stats only if job is completed at creation
      if (selectedClient.value && jobData.status === 'completed') {
        await updateClientStatsFromJob(selectedClient.value.id, jobData)
      }
      
      useToast().success('Trabajo creado exitosamente')
    }

    // Close modal - jobs will update automatically via subscription
    jobModal.value?.closeModal()
    
  } catch (err) {
    console.error('Error saving job:', err)
    useToast().error('Error al guardar trabajo')
  } finally {
    savingJob.value = false
  }
}

const deleteJob = async () => {
  if (!confirm(`¿Está seguro de eliminar este trabajo?`)) {
    return
  }

  try {
    await jobsStore.deleteJob(editingJob.value.id)
    useToast().success('Trabajo eliminado exitosamente')
    jobModal.value?.closeModal()
  } catch (err) {
    console.error('Error deleting job:', err)
    useToast().error('Error al eliminar trabajo')
  }
}

// Client stats update helpers
const updateClientStats = async (clientId, updates) => {
  try {
    await clientsStore.updateClient(clientId, updates)
  } catch (err) {
    console.error('Error updating client stats:', err)
  }
}

const updateClientStatsFromJob = async (clientId, newJob, oldJob = null) => {
  try {
    const client = clientsStore.getClientById(clientId)
    if (!client) return

    // Recalculate totals from all jobs for this client
    const allClientJobs = jobsStore.getJobsByClient(clientId)
    
    let totalCompletedJobs = 0
    let totalSpent = 0
    
    // Count only completed jobs and their prices
    allClientJobs.forEach(job => {
      // Handle both the new/updated job and existing jobs
      let jobToCheck = job
      if (job.id === newJob.id || (oldJob && job.id === oldJob.id)) {
        jobToCheck = newJob // Use the updated job data
      }
      
      if (jobToCheck.status === 'completed') {
        totalCompletedJobs++
        totalSpent += (jobToCheck.price || 0)
      }
    })
    
    // If this is a new job (no oldJob), include it in the count
    if (!oldJob && newJob.status === 'completed') {
      totalCompletedJobs++
      totalSpent += (newJob.price || 0)
    }

    await updateClientStats(clientId, {
      totalJobs: totalCompletedJobs,
      totalSpent: totalSpent
    })
  } catch (err) {
    console.error('Error updating client stats from job:', err)
  }
}

// Initialize stores and set up real-time subscription
onMounted(async () => {
  try {
    pageLoading.value = true

    // Initialize stores
    await jobsStore.initialize()
    await clientsStore.initialize()
    await serviceTypesStore.initialize()
    await slotAvailabilityStore.initialize()

    // Load current week slots for availability view
    await slotAvailabilityStore.loadWeekSlots(currentWeekStart.value)

    // Wait a brief moment for real-time subscriptions to populate data
    await new Promise(resolve => setTimeout(resolve, 300))

    // Setup mobile scroll indicators
    nextTick(() => {
      updateScrollIndicators()
    })
  } catch (err) {
    console.error('Error initializing schedule page:', err)
    useToast().error('Error al cargar datos del calendario')
  } finally {
    pageLoading.value = false
  }
})

// Watch for view changes to update scroll indicators
watch(currentView, (newView) => {
  if (newView === 'weekly-timeline') {
    nextTick(() => {
      updateScrollIndicators()
    })
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  jobsStore.cleanup()
})
</script>