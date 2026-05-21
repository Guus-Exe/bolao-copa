import Link from "next/link"

import { signUp } from "@/app/actions/auth"
import { AuthForm } from "@/components/auth/AuthForm"

export default function SignupPage({
  searchParams
}: {
  searchParams?: { message?: string }
}) {
  return (
    <AuthForm
      title="Criar conta"
      description="Cadastre-se para aguardar a liberacao do admin."
      action={signUp}
      buttonLabel="Criar conta"
      message={searchParams?.message}
      footer={
        <>
          Ja tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Entrar
          </Link>
        </>
      }
    />
  )
}
