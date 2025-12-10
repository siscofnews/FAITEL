import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Church } from "lucide-react";
import { Link } from "react-router-dom";

export default function CadastroSucesso() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Cadastro Realizado!</CardTitle>
          <CardDescription className="text-base">
            Seu cadastro foi realizado com sucesso. A liderança da igreja receberá seus dados e entrará em contato em breve.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Obrigado por se cadastrar em nossa igreja. Deus abençoe sua vida!
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Ir para o Portal
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}