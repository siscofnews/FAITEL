
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card border border-destructive/50 rounded-lg p-6 shadow-lg">
                        <div className="flex items-center gap-3 text-destructive mb-4">
                            <AlertTriangle className="h-8 w-8" />
                            <h1 className="text-xl font-bold">Algo deu errado</h1>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-md mb-6 overflow-auto max-h-[300px]">
                            <p className="font-mono text-sm text-foreground break-words mb-2">
                                {this.state.error?.toString()}
                            </p>
                            {this.state.errorInfo && (
                                <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = "/"}
                            >
                                Voltar ao Início
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                            >
                                Tentar Novamente
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
