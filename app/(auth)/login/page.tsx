import Link from "next/link"

import { signIn } from "@/app/actions/auth"
import { AuthForm } from "@/components/auth/AuthForm"

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage(props: Props) {
  const searchParams = await props.searchParams
  const message = typeof searchParams.message === "string" ? searchParams.message : undefined

  return (
    <AuthForm
      title="Entrar no bolão"
      description="Use seu email e senha para acessar seus palpites."
      action={signIn}
      buttonLabel="Entrar"
      message={message}
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/signup" className="font-semibold text-primary">
            Criar conta
          </Link>
        </>
      }
      showRememberMe={true}
      forgotPasswordLink="/forgot-password"
    />
  )
}
