import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { RegisterForm } from '@/components/auth/register-form'
import { GuestOnly } from '@/components/auth/guest-only'

export default function RegisterPage() {
  return (
    <GuestOnly><AuthShell
      title="Создать аккаунт"
      description="Зарегистрируйтесь, чтобы начать работу с autoSlot."
      footer={
        <>
          Уже есть аккаунт?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Вход
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell></GuestOnly>
  )
}
