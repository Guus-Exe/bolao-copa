"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, Home, XOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro (útil em produção com Sentry/Datadog)
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-destructive/10 rounded-full flex items-center justify-center">
          <div className="w-24 h-32 bg-destructive rounded-sm shadow-lg flex items-center justify-center border-2 border-white/20 transform -rotate-12">
            <XOctagon className="w-12 h-12 text-destructive-foreground/50" />
          </div>
        </div>
      </div>
      
      <h2 className="text-4xl font-black tracking-tight mb-2 text-destructive uppercase italic">
        Falta Dura!
      </h2>
      <h3 className="text-2xl font-bold mb-4">Erro de Sistema</h3>
      
      <p className="text-muted-foreground max-w-md mb-8 text-lg">
        Tivemos um problema técnico inesperado no campo. A equipe do VAR já está analisando a jogada. 
        Por favor, tente novamente ou volte para o vestiário.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto border-dashed border-2" 
          onClick={() => reset()}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Voltar para o Vestiário (Início)
          </Link>
        </Button>
      </div>
    </div>
  );
}
