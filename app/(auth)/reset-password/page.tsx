import Link from "next/link"
import { updatePassword } from "@/app/actions/auth"
import { AuthForm } from "@/components/auth/AuthForm"

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResetPasswordPage(props: Props) {
  const searchParams = await props.searchParams
  const message = typeof searchParams.message === "string" ? searchParams.message : undefined

  return (
    <AuthForm
      title="Nova senha"
      description="Informe a sua nova senha."
      action={updatePassword}
      buttonLabel="Salvar senha"
      message={message}
      showEmail={false}
      showConfirmPassword={true}
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
