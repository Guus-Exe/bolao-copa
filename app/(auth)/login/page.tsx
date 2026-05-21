import Link from "next/link"

import { signIn } from "@/app/actions/auth"
import { AuthForm } from "@/components/auth/AuthForm"

export default function LoginPage({
  searchParams
}: {
  searchParams?: { message?: string }
}) {
  return (
    <AuthForm
      title="Entrar no bolao"
      description="Use seu email e senha para acessar seus palpites."
      action={signIn}
      buttonLabel="Entrar"
      message={searchParams?.message}
      footer={
        <>
          Ainda nao tem conta?{" "}
          <Link href="/signup" className="font-semibold text-primary">
            Criar conta
          </Link>
        </>
      }
    />
  )
}
