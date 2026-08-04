'use client'

import { isAxiosError } from 'axios'
import { type ChangeEvent, type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { isApiErrorResponse } from '@/lib/api-error'
import { loginSchema } from '@/lib/validations/auth'

type LoginForm = {
  username: string
  password: string
}

type FieldErrors = Partial<Record<keyof LoginForm, string>>

const initialForm: LoginForm = {
  username: '',
  password: '',
}

function isLoginField(field?: string | null): field is keyof LoginForm {
  return field === 'username' || field === 'password'
}

function showLoginError(messages: string[]) {
  toast.error('Не удалось войти', {
    description: messages.join(' '),
  })
}

export function useLogin() {
  const [form, setForm] = useState<LoginForm>(initialForm)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    const fieldName = name as keyof LoginForm

    setForm((current) => ({ ...current, [fieldName]: value }))
    setFieldErrors((current) => ({ ...current, [fieldName]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = loginSchema.safeParse(form)

    if (!result.success) {
      const validationErrors: FieldErrors = {}

      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof LoginForm
        if (fieldName && !validationErrors[fieldName]) {
          validationErrors[fieldName] = issue.message
        }
      }

      setFieldErrors(validationErrors)
      showLoginError(Object.values(validationErrors))
      return
    }

    setFieldErrors({})
    setLoading(true)

    try {
      await login(result.data.username, result.data.password)
      toast.success('Вход выполнен', {
        description: 'Вы успешно вошли в аккаунт.',
      })
      router.replace('/')
    } catch (requestError) {
      if (!isAxiosError(requestError)) {
        showLoginError(['Произошла непредвиденная ошибка. Попробуйте снова.'])
        return
      }

      const { response } = requestError

      if (!response) {
        showLoginError([
          'Не удалось подключиться к серверу. Проверьте, что API запущен.',
        ])
        return
      }

      if (response.status === 404) {
        showLoginError([
          'Сервис авторизации пока не настроен или адрес API указан неверно.',
        ])
        return
      }

      if (isApiErrorResponse(response.data)) {
        const apiFieldErrors: FieldErrors = {}
        const messages: string[] = []

        for (const apiError of response.data.errors) {
          messages.push(apiError.message)

          if (isLoginField(apiError.field)) {
            apiFieldErrors[apiError.field] ??= apiError.message
          }
        }

        setFieldErrors(apiFieldErrors)
        showLoginError(messages)
        return
      }

      if (response.status >= 500) {
        showLoginError(['Сервер временно недоступен. Попробуйте позже.'])
        return
      }

      showLoginError(['Не удалось войти. Проверьте имя пользователя и пароль.'])
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
