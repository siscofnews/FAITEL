import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Volume2, Headphones } from "lucide-react";

export default function RadioSISCOF() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Radio className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">Rádio SISCOF</h1>
                        <p className="text-muted-foreground">Transmissão ao vivo</p>
                    </div>
                </div>

                <Card className="mb-6">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-xl"></div>
                                <div className="relative bg-gradient-to-br from-primary to-purple-600 p-8 rounded-full">
                                    <Volume2 className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Ouça Nossa Programação</CardTitle>
                        <CardDescription className="text-base">
                            Música, mensagens e programação especial 24 horas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-[16/6] bg-muted rounded-lg overflow-hidden border-2 border-primary/20">
                            <iframe
                                src="https://play.stmip.net/mnuyakdn/dois.html"
                                className="w-full h-full"
                                frameBorder="0"
                                allow="autoplay"
                                title="Rádio SISCOF Player"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Headphones className="w-5 h-5 text-primary" />
                                <CardTitle className="text-lg">Alta Qualidade</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Transmissão em alta definição para melhor experiência
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Radio className="w-5 h-5 text-primary" />
                                <CardTitle className="text-lg">24/7 Online</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Programação contínua disponível todos os dias
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Volume2 className="w-5 h-5 text-primary" />
                                <CardTitle className="text-lg">Multiplataforma</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Ouça em qualquer dispositivo - PC, tablet ou celular
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <h3 className="font-semibold text-lg mb-2">Programação Especial</h3>
                            <p className="text-sm text-muted-foreground">
                                Participe da nossa programação entrando em contato com a equipe!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
