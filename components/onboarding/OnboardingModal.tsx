"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trophy, MessageSquare, UserCircle, BookOpen } from "lucide-react";

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o modal já foi visto
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenOnboarding", "true");
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const goToProfile = () => {
    handleClose();
    router.push("/perfil");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Bem-vindo ao Bolão!"}
            {step === 2 && "Acompanhe o Ranking"}
            {step === 3 && "Entenda as Regras"}
            {step === 4 && "Participe do Chat"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Antes de começarmos, que tal dar uma cara para o seu perfil?"}
            {step === 2 && "Veja quem está na liderança e mostre suas habilidades."}
            {step === 3 && "Saiba exatamente como funciona o sistema de pontuação."}
            {step === 4 && "Converse com outros participantes em tempo real."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 min-h-[200px] text-center">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center">
                <UserCircle className="w-16 h-16 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Recomendamos que você adicione uma foto e escolha um apelido bacana para que os outros jogadores possam te reconhecer facilmente!
              </p>
              <Button variant="outline" onClick={goToProfile} className="w-full">
                Configurar Perfil Agora
              </Button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center">
                <Trophy className="w-16 h-16 text-yellow-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Seus pontos são calculados com base nos seus palpites. Acompanhe sua posição no <strong>Ranking</strong> e veja quem será o grande campeão!
              </p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center">
                <BookOpen className="w-16 h-16 text-[var(--green-500)]" />
              </div>
              <p className="text-sm text-muted-foreground">
                Placar exato vale <strong>3 pontos</strong>! Se acertar só o vencedor, leva <strong>1 ponto</strong>.
                Não deixe de ler a seção de <strong>Regras</strong> para ver também como funciona o desempate.
              </p>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center">
                <MessageSquare className="w-16 h-16 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Temos um <strong>Chat</strong> ao vivo onde você pode interagir, comentar os jogos e zoar a galera durante as partidas. Não fique de fora!
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center w-full">
          <div className="flex space-x-1">
            <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${step === 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${step === 4 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
          <div className="space-x-2">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            <Button onClick={nextStep}>
              {step === 4 ? "Começar!" : "Próximo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
