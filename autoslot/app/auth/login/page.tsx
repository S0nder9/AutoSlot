import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'
import { GuestOnly } from '@/components/auth/guest-only'

export default function LoginPage() {
  return (
    <GuestOnly><AuthShell
      title="С возвращением"
      description="Войдите в аккаунт, чтобы управлять записями."
      footer={
        <>
          Нет аккаунта?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Регистрация
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell></GuestOnly>
  )
}
