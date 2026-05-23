import Link from "next/link"
import { forgotPassword } from "@/app/actions/auth"
import { AuthForm } from "@/components/auth/AuthForm"

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ForgotPasswordPage(props: Props) {
  const searchParams = await props.searchParams
  const message = typeof searchParams.message === "string" ? searchParams.message : undefined

  return (
    <AuthForm
      title="Esqueceu a senha?"
      description="Informe seu email para receber um link de redefinição."
      action={forgotPassword}
      buttonLabel="Enviar link"
      message={message}
      showPassword={false}
      footer={
        <>
          Lembrou a senha?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Voltar para o login
          </Link>
        </>
      }
    />
  )
}
