"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, CircleSlash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-destructive/10 rounded-full flex items-center justify-center">
          <div className="w-24 h-32 bg-destructive rounded-sm shadow-lg flex items-center justify-center border-2 border-white/20 transform rotate-12 rotate">
            <CircleSlash className="w-12 h-12 text-destructive-foreground/50" />
          </div>
        </div>
      </div>
      
      <h2 className="text-4xl font-black tracking-tight mb-2 text-destructive uppercase italic">
        Cartão Vermelho!
      </h2>
      <h3 className="text-2xl font-bold mb-4">Erro 404 - Fora de campo</h3>
      
      <p className="text-muted-foreground max-w-md mb-8 text-lg">
        Você tentou fazer uma jogada em uma área que não existe. 
        O juiz apitou e anulou este ataque. A página que você procura não foi encontrada.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto border-dashed border-2" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar a jogada
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
