'use client'

import { isAxiosError } from 'axios'
import { type ChangeEvent, type FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/auth-provider'
import { isApiErrorResponse } from '@/lib/api-error'
import { registerSchema } from '@/lib/validations/auth'

type RegisterForm = {
  username: string
  password: string
}

type FieldErrors = Partial<Record<keyof RegisterForm, string>>

const initialForm: RegisterForm = {
  username: '',
  password: '',
}

function isRegisterField(field?: string | null): field is keyof RegisterForm {
  return field === 'username' || field === 'password'
}

function showRegistrationError(messages: string[]) {
  toast.error('Не удалось зарегистрироваться', {
    description: messages.join(' '),
  })
}

export function useRegister() {
  const [form, setForm] = useState<RegisterForm>(initialForm)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login, register } = useAuth()

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    const fieldName = name as keyof RegisterForm

    setForm((current) => ({ ...current, [fieldName]: value }))
    setFieldErrors((current) => ({ ...current, [fieldName]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = registerSchema.safeParse(form)

    if (!result.success) {
      const validationErrors: FieldErrors = {}

      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof RegisterForm
        if (fieldName && !validationErrors[fieldName]) {
          validationErrors[fieldName] = issue.message
        }
      }

      setFieldErrors(validationErrors)
      showRegistrationError(Object.values(validationErrors))
      return
    }

    setFieldErrors({})
    setLoading(true)

    try {
      await register(result.data.username, result.data.password)
      toast.success('Аккаунт создан', {
        description: 'Регистрация прошла успешно.',
      })

      try {
        await login(result.data.username, result.data.password)
        router.replace('/dashboard/profile')
      } catch (loginError) {
        const message =
          isAxiosError(loginError) && isApiErrorResponse(loginError.response?.data)
            ? loginError.response.data.errors[0]?.message
            : null

        toast.error('Не удалось войти автоматически', {
          description: message ?? 'Войдите в созданный аккаунт вручную.',
        })
        router.replace('/auth/login')
      }
    } catch (requestError) {
      if (!isAxiosError(requestError)) {
        showRegistrationError(['Произошла непредвиденная ошибка. Попробуйте снова.'])
        return
      }

      const { response } = requestError

      if (!response) {
        showRegistrationError([
          'Не удалось подключиться к серверу. Проверьте, что API запущен.',
        ])
        return
      }

      if (response.status === 404) {
        showRegistrationError([
          'Сервис регистрации пока не настроен или адрес API указан неверно.',
        ])
        return
      }

      if (isApiErrorResponse(response.data)) {
        const apiFieldErrors: FieldErrors = {}
        const messages: string[] = []

        for (const apiError of response.data.errors) {
          messages.push(apiError.message)

          if (isRegisterField(apiError.field)) {
            apiFieldErrors[apiError.field] ??= apiError.message
          }
        }

        setFieldErrors(apiFieldErrors)
        showRegistrationError(messages)
        return
      }

      if (response.status >= 500) {
        showRegistrationError(['Сервер временно недоступен. Попробуйте позже.'])
        return
      }

      showRegistrationError(['Не удалось зарегистрироваться. Попробуйте снова.'])
    } finally {
      setLoading(false)
    }
  }

  return {
    fieldErrors,
    form,
    handleChange,
    handleSubmit,
    loading,
  }
}
