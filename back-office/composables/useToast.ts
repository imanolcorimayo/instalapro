import { toast, type ToastOptions } from 'vue3-toastify'

export interface UseToastReturn {
  success: (message: string, options?: ToastOptions) => void
  error: (message: string, options?: ToastOptions) => void
  warning: (message: string, options?: ToastOptions) => void
  info: (message: string, options?: ToastOptions) => void
}

export const useToast = (): UseToastReturn => {
  const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light'
  }

  const success = (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options })
  }

  const error = (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options })
  }

  const warning = (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultOptions, ...options })
  }

  const info = (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options })
  }

  return {
    success,
    error,
    warning,
    info
  }
}