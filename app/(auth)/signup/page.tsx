import Link from "next/link"

import { signUp } from "@/app/actions/auth"
import { AuthForm } from "@/components/auth/AuthForm"

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SignupPage(props: Props) {
  const searchParams = await props.searchParams
  const message = typeof searchParams.message === "string" ? searchParams.message : undefined

  return (
    <AuthForm
      title="Criar conta"
      description="Cadastre-se para aguardar a liberacao do admin."
      action={signUp}
      buttonLabel="Criar conta"
      message={message}
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Entrar
          </Link>
        </>
      }
    />
  )
}
