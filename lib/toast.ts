import { toast as sonnerToast } from 'sonner'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface ToastOptions {
  id?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

class ToastService {
  success(message: string, options?: ToastOptions) {
    return sonnerToast.success(message, options)
  }

  error(message: string, options?: ToastOptions) {
    return sonnerToast.error(message, options)
  }

  warning(message: string, options?: ToastOptions) {
    return sonnerToast.warning(message, options)
  }

  info(message: string, options?: ToastOptions) {
    return sonnerToast.info(message, options)
  }

  loading(message: string, options?: ToastOptions) {
    return sonnerToast.loading(message, options)
  }

  dismiss(id?: string) {
    return sonnerToast.dismiss(id)
  }

  // Convenience methods for common error scenarios
  networkError(action?: string) {
    return this.error(
      action ? `Network error while ${action}. Please try again.` : 'Network error. Please try again.',
      {
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      }
    )
  }

  validationError(message: string) {
    return this.error(message, { duration: 5000 })
  }

  operationSuccess(action: string) {
    return this.success(`${action} completed successfully`)
  }

  operationError(action: string, error?: any) {
    console.error(`${action} failed:`, error)
    return this.error(`Failed to ${action}. Please try again.`)
  }

  // Promise-based operations
  async promise<T>(
    promise: Promise<T>,
    loadingMessage: string,
    successMessage: string,
    errorMessage?: string
  ): Promise<T> {
    const loadingId = this.loading(loadingMessage)
    
    try {
      const result = await promise
      this.dismiss(loadingId)
      this.success(successMessage)
      return result
    } catch (error) {
      this.dismiss(loadingId)
      this.error(errorMessage || 'Operation failed. Please try again.')
      throw error
    }
  }
}

export const toast = new ToastService()