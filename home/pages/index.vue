<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
            <IconMdiAirConditioner class="w-5 h-5 text-white" />
          </div>
          <span class="text-xl font-semibold text-slate-800">InstalaPro</span>
        </div>
        <nav class="hidden md:flex items-center gap-8">
          <a href="#funcionalidades" class="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">Funcionalidades</a>
          <a href="#como-funciona" class="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">Cómo Funciona</a>
          <a href="#precios" class="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">Precios</a>
          <a href="#contacto" class="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">Contacto</a>
        </nav>
        <a
          href="https://instalapro-back-office.web.app"
          target="_blank"
          class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
        >
          Empezar gratis
        </a>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="pt-16 pb-20 md:pt-24 md:pb-28 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Text Content -->
          <div class="text-center lg:text-left">
            <div class="inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <IconMdiGift class="w-4 h-4" />
              30 días gratis, sin tarjeta de crédito
            </div>
            <h1 class="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
              Software de gestión para técnicos de aire acondicionado
            </h1>
            <p class="text-lg md:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
              Organiza tus trabajos, gestiona clientes y obtené tu propia página de reservas. Todo en un solo lugar.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="https://instalapro-back-office.web.app"
                target="_blank"
                class="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-base font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                Crear cuenta gratis
                <IconMdiArrowRight class="w-5 h-5" />
              </a>
            </div>
          </div>

          <!-- Hero Image -->
          <div class="relative">
            <img
              src="/images/image-1.png"
              alt="Técnico instalando aire acondicionado"
              class="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg"
            />
            <!-- Decorative element -->
            <div class="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-sky-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Proof Stats -->
    <section class="py-12 border-y border-gray-100 bg-white">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-slate-900 mb-1">100+</div>
            <div class="text-sm text-slate-500">Técnicos registrados</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-slate-900 mb-1">500+</div>
            <div class="text-sm text-slate-500">Trabajos gestionados</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-slate-900 mb-1">1.000+</div>
            <div class="text-sm text-slate-500">Clientes registrados</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-slate-900 mb-1">Córdoba</div>
            <div class="text-sm text-slate-500">Argentina</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="funcionalidades" class="py-20 md:py-28">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Todo lo que necesitas</h2>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            Herramientas diseñadas para simplificar la gestión de tu negocio
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Schedule Management -->
          <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg hover:border-gray-300 transition-all">
            <div class="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-5">
              <IconMdiCalendarMonth class="w-6 h-6 text-sky-600" />
            </div>
            <h3 class="text-xl font-semibold text-slate-900 mb-3">Agenda de trabajos</h3>
            <p class="text-slate-600 mb-5">Organiza todos tus trabajos en un calendario visual e intuitivo.</p>
            <ul class="space-y-2.5">
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Vista semanal y mensual</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Estados de trabajo</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Control de superposición</span>
              </li>
            </ul>
          </div>

          <!-- Client Database -->
          <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg hover:border-gray-300 transition-all">
            <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
              <IconMdiAccountGroup class="w-6 h-6 text-emerald-600" />
            </div>
            <h3 class="text-xl font-semibold text-slate-900 mb-3">Base de clientes</h3>
            <p class="text-slate-600 mb-5">Toda la información de tus clientes centralizada.</p>
            <ul class="space-y-2.5">
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Historial de servicios</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Datos de contacto</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>WhatsApp integrado</span>
              </li>
            </ul>
          </div>

          <!-- Booking Page -->
          <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg hover:border-gray-300 transition-all">
            <div class="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-5">
              <IconMdiWeb class="w-6 h-6 text-violet-600" />
            </div>
            <h3 class="text-xl font-semibold text-slate-900 mb-3">Página de reservas</h3>
            <p class="text-slate-600 mb-5">Tu propia página para que tus clientes reserven turnos.</p>
            <ul class="space-y-2.5">
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>URL personalizada</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Disponibilidad en tiempo real</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Reservas automáticas</span>
              </li>
            </ul>
          </div>

          <!-- Reports -->
          <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg hover:border-gray-300 transition-all">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5">
              <IconMdiChartLine class="w-6 h-6 text-amber-600" />
            </div>
            <h3 class="text-xl font-semibold text-slate-900 mb-3">Reportes</h3>
            <p class="text-slate-600 mb-5">Visualiza el rendimiento de tu negocio semana a semana.</p>
            <ul class="space-y-2.5">
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Ingresos semanales</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Control de gastos</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Clientes nuevos</span>
              </li>
            </ul>
          </div>

          <!-- WhatsApp Integration -->
          <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg hover:border-gray-300 transition-all">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-5">
              <IconMdiWhatsapp class="w-6 h-6 text-green-600" />
            </div>
            <h3 class="text-xl font-semibold text-slate-900 mb-3">WhatsApp</h3>
            <p class="text-slate-600 mb-5">Comunicación directa con tus clientes desde la plataforma.</p>
            <ul class="space-y-2.5">
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Un click para contactar</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Desde cada cliente</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Sin apps adicionales</span>
              </li>
            </ul>
          </div>

          <!-- Service Types -->
          <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg hover:border-gray-300 transition-all">
            <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-5">
              <IconMdiWrench class="w-6 h-6 text-slate-600" />
            </div>
            <h3 class="text-xl font-semibold text-slate-900 mb-3">Servicios</h3>
            <p class="text-slate-600 mb-5">Configura los servicios que ofrecés con precios.</p>
            <ul class="space-y-2.5">
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Instalación, service, reparación</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Precios personalizados</span>
              </li>
              <li class="flex items-start gap-2.5 text-sm text-slate-600">
                <IconMdiCheck class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Duración estimada</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Image Gallery Section -->
    <section class="py-20 md:py-28 bg-slate-900">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Hecho para profesionales</h2>
          <p class="text-lg text-slate-400 max-w-2xl mx-auto">
            Desde instalaciones residenciales hasta grandes proyectos comerciales
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Image 1 -->
          <div class="aspect-square rounded-xl overflow-hidden">
            <img src="/images/image-1.png" alt="Instalación de aire acondicionado" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>

          <!-- Image 2 -->
          <div class="aspect-square rounded-xl overflow-hidden">
            <img src="/images/image-2.png" alt="Equipo de técnicos trabajando" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>

          <!-- Image 3 -->
          <div class="aspect-square rounded-xl overflow-hidden">
            <img src="/images/image-2.png" alt="Trabajo profesional" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>

          <!-- Image 4 -->
          <div class="aspect-square rounded-xl overflow-hidden">
            <img src="/images/image-1.png" alt="Instalación comercial" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="como-funciona" class="py-20 md:py-28 bg-slate-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Empezar es simple</h2>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            En 3 pasos tenés tu negocio organizado
          </p>
        </div>

        <div class="max-w-4xl mx-auto">
          <div class="grid md:grid-cols-3 gap-12">
            <!-- Step 1 -->
            <div class="text-center">
              <div class="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-xl font-bold">
                1
              </div>
              <h3 class="text-lg font-semibold text-slate-900 mb-2">Creá tu cuenta</h3>
              <p class="text-slate-600">
                Registrate gratis con tu email. Toma menos de 1 minuto.
              </p>
            </div>

            <!-- Step 2 -->
            <div class="text-center">
              <div class="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-xl font-bold">
                2
              </div>
              <h3 class="text-lg font-semibold text-slate-900 mb-2">Configurá tus servicios</h3>
              <p class="text-slate-600">
                Agregá los servicios que ofrecés con sus precios.
              </p>
            </div>

            <!-- Step 3 -->
            <div class="text-center">
              <div class="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-xl font-bold">
                3
              </div>
              <h3 class="text-lg font-semibold text-slate-900 mb-2">Compartí tu link</h3>
              <p class="text-slate-600">
                Enviá tu página de reservas a tus clientes.
              </p>
            </div>
          </div>

          <!-- Example URL -->
          <div class="mt-16 bg-white rounded-2xl p-8 text-center border border-gray-200">
            <p class="text-slate-600 mb-4">Tu página de reservas será:</p>
            <div class="bg-slate-50 rounded-xl px-6 py-4 inline-block">
              <span class="text-slate-500 text-lg">agenda.instalapro.com/</span>
              <span class="text-slate-900 font-semibold text-lg">tu-nombre</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="precios" class="py-20 md:py-28">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Precio simple y transparente</h2>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            Empezá gratis, después decidís
          </p>
        </div>

        <div class="max-w-lg mx-auto">
          <!-- Single Pricing Card -->
          <div class="bg-white rounded-3xl border-2 border-slate-900 p-10 relative">
            <div class="absolute -top-4 left-1/2 -translate-x-1/2">
              <span class="bg-slate-900 text-white text-sm px-4 py-1.5 rounded-full font-medium">30 días gratis</span>
            </div>

            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-slate-900 mb-4">Plan Profesional</h3>
              <div class="flex items-baseline justify-center gap-1">
                <span class="text-5xl font-bold text-slate-900">$10.000</span>
                <span class="text-slate-500 text-lg">/mes</span>
              </div>
              <p class="text-slate-500 mt-2">ARS · Pago mensual con Mercado Pago</p>
            </div>

            <ul class="space-y-4 mb-10">
              <li class="flex items-center gap-3">
                <div class="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconMdiCheck class="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span class="text-slate-700">Clientes ilimitados</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconMdiCheck class="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span class="text-slate-700">Trabajos ilimitados</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconMdiCheck class="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span class="text-slate-700">Tu página de reservas</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconMdiCheck class="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span class="text-slate-700">Reportes y estadísticas</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconMdiCheck class="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span class="text-slate-700">Soporte por WhatsApp</span>
              </li>
              <li class="flex items-center gap-3">
                <div class="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconMdiCheck class="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span class="text-slate-700">Cancela cuando quieras</span>
              </li>
            </ul>

            <a
              href="https://instalapro-back-office.web.app"
              target="_blank"
              class="block w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-full font-semibold transition-colors text-center"
            >
              Empezar prueba gratis
            </a>

            <p class="text-center text-slate-500 text-sm mt-4">
              Sin tarjeta de crédito para comenzar
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contacto" class="py-20 md:py-28 bg-slate-50">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">¿Tenés dudas?</h2>
          <p class="text-lg text-slate-600 mb-12">
            Estamos para ayudarte
          </p>

          <div class="grid sm:grid-cols-2 gap-6">
            <!-- Email -->
            <a
              href="mailto:imanolcorimayo@gmail.com"
              class="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all group"
            >
              <div class="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-sky-200 transition-colors">
                <IconMdiEmail class="w-7 h-7 text-sky-600" />
              </div>
              <h3 class="font-semibold text-slate-900 mb-1">Email</h3>
              <p class="text-sky-600">imanolcorimayo@gmail.com</p>
            </a>

            <!-- WhatsApp -->
            <a
              href="https://wa.me/543513467739"
              target="_blank"
              class="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all group"
            >
              <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <IconMdiWhatsapp class="w-7 h-7 text-green-600" />
              </div>
              <h3 class="font-semibold text-slate-900 mb-1">WhatsApp</h3>
              <p class="text-green-600">+54 351 3467739</p>
            </a>
          </div>

          <div class="mt-10 flex items-center justify-center gap-2 text-slate-500">
            <IconMdiMapMarker class="w-5 h-5" />
            <span>Córdoba, Argentina</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 md:py-28 bg-slate-900">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Empezá a organizar tu negocio
        </h2>
        <p class="text-slate-400 mb-10 max-w-xl mx-auto text-lg">
          Probá gratis por 30 días. Sin compromisos.
        </p>
        <a
          href="https://instalapro-back-office.web.app"
          target="_blank"
          class="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-full text-base font-semibold transition-colors"
        >
          Crear cuenta gratis
          <IconMdiArrowRight class="w-5 h-5" />
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-950 text-slate-400 py-12">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
              <IconMdiAirConditioner class="w-4 h-4 text-white" />
            </div>
            <span class="text-white font-semibold">InstalaPro</span>
          </div>

          <div class="flex flex-wrap justify-center gap-8 text-sm">
            <a href="#funcionalidades" class="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#como-funciona" class="hover:text-white transition-colors">Cómo Funciona</a>
            <a href="#precios" class="hover:text-white transition-colors">Precios</a>
            <a href="#contacto" class="hover:text-white transition-colors">Contacto</a>
          </div>

          <div class="flex items-center gap-2 text-sm">
            <IconMdiMapMarker class="w-4 h-4" />
            <span>Córdoba, Argentina</span>
          </div>
        </div>

        <div class="mt-10 pt-8 border-t border-slate-800 text-center text-sm">
          <p>&copy; {{ new Date().getFullYear() }} InstalaPro. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import IconMdiAirConditioner from '~icons/mdi/air-conditioner'
import IconMdiArrowRight from '~icons/mdi/arrow-right'
import IconMdiGift from '~icons/mdi/gift'
import IconMdiImageArea from '~icons/mdi/image-area'
import IconMdiCalendarMonth from '~icons/mdi/calendar-month'
import IconMdiAccountGroup from '~icons/mdi/account-group'
import IconMdiWeb from '~icons/mdi/web'
import IconMdiChartLine from '~icons/mdi/chart-line'
import IconMdiWhatsapp from '~icons/mdi/whatsapp'
import IconMdiWrench from '~icons/mdi/wrench'
import IconMdiCheck from '~icons/mdi/check'
import IconMdiEmail from '~icons/mdi/email'
import IconMdiMapMarker from '~icons/mdi/map-marker'

useSeoMeta({
  title: 'InstalaPro - Software de Gestión para Técnicos de Aire Acondicionado',
  description: 'Organiza tu negocio de aire acondicionado. Gestiona clientes, agenda trabajos y obtené tu propia página de reservas. 30 días gratis.',
  ogTitle: 'InstalaPro - Software para Técnicos de Aire Acondicionado',
  ogDescription: 'Organiza tu negocio: clientes, agenda, reportes y tu página de reservas personal. Diseñado para técnicos en Argentina.',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image'
})
</script>
