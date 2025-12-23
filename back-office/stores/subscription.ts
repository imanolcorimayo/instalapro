import { defineStore } from 'pinia'
import type { Subscription, SubscriptionStatus } from '~/types'
import { getFirestoreInstance } from '~/utils/firebase'
import { collection, query, where, getDocs, onSnapshot, type Unsubscribe } from 'firebase/firestore'

// MercadoPago subscription plan URL
const MP_SUBSCRIPTION_URL = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=8f38bc853ae8411db6748b0f798b9e16'

// Monthly subscription price in ARS
const SUBSCRIPTION_PRICE = 10000

export const useSubscriptionStore = defineStore('subscription', () => {
  // ==========================================
  // STATE
  // ==========================================

  const subscription = ref<Subscription | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const initialized = ref<boolean>(false)

  let unsubscribeListener: Unsubscribe | null = null

  // ==========================================
  // GETTERS
  // ==========================================

  const hasActiveSubscription = computed(() => {
    // TODO: Re-enable subscription validation when ready
    // if (!subscription.value) return false
    // return subscription.value.status === 'authorized'
    return true // Temporarily disabled - all users have access
  })

  const isPendingSubscription = computed(() => {
    if (!subscription.value) return false
    return subscription.value.status === 'pending'
  })

  const subscriptionStatus = computed((): SubscriptionStatus | null => {
    return subscription.value?.status || null
  })

  const subscriptionPrice = computed(() => SUBSCRIPTION_PRICE)

  const formattedPrice = computed(() => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(SUBSCRIPTION_PRICE)
  })

  // ==========================================
  // ACTIONS
  // ==========================================

  const loadSubscription = async (): Promise<boolean> => {
    const authStore = useAuthStore()

    if (!authStore.user) {
      initialized.value = true
      return false
    }

    loading.value = true
    error.value = null

    try {
      const db = getFirestoreInstance()
      const subscriptionsRef = collection(db, 'subscriptions')
      const q = query(subscriptionsRef, where('userUid', '==', authStore.user.uid))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        subscription.value = null
        initialized.value = true
        return false
      }

      // Get the most recent subscription
      const doc = querySnapshot.docs[0]
      subscription.value = {
        id: doc.id,
        ...doc.data()
      } as Subscription

      initialized.value = true
      return true
    } catch (err: any) {
      error.value = err.message || 'Error cargando la suscripción'
      console.error('Error loading subscription:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const subscribeToChanges = () => {
    const authStore = useAuthStore()

    if (!authStore.user) return

    try {
      const db = getFirestoreInstance()
      const subscriptionsRef = collection(db, 'subscriptions')
      const q = query(subscriptionsRef, where('userUid', '==', authStore.user.uid))

      unsubscribeListener = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          subscription.value = null
          return
        }

        const doc = snapshot.docs[0]
        subscription.value = {
          id: doc.id,
          ...doc.data()
        } as Subscription
      }, (err) => {
        console.error('Subscription listener error:', err)
        error.value = 'Error en la conexión con la suscripción'
      })
    } catch (err: any) {
      console.error('Error setting up subscription listener:', err)
    }
  }

  const unsubscribeFromChanges = () => {
    if (unsubscribeListener) {
      unsubscribeListener()
      unsubscribeListener = null
    }
  }

  const redirectToMercadoPago = () => {
    if (process.client) {
      window.location.href = MP_SUBSCRIPTION_URL
    }
  }

  const getSubscriptionUrl = () => {
    return MP_SUBSCRIPTION_URL
  }

  const initialize = async (): Promise<void> => {
    if (initialized.value) return

    await loadSubscription()
    subscribeToChanges()
  }

  const resetStore = () => {
    subscription.value = null
    loading.value = false
    error.value = null
    initialized.value = false
    unsubscribeFromChanges()
  }

  const clearError = () => {
    error.value = null
  }

  // ==========================================
  // RETURN STORE INTERFACE
  // ==========================================

  return {
    // State
    subscription,
    loading,
    error,
    initialized,

    // Getters
    hasActiveSubscription,
    isPendingSubscription,
    subscriptionStatus,
    subscriptionPrice,
    formattedPrice,

    // Actions
    loadSubscription,
    subscribeToChanges,
    unsubscribeFromChanges,
    redirectToMercadoPago,
    getSubscriptionUrl,
    initialize,
    resetStore,
    clearError
  }
})
