import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download, FileImage, Copy, Link as LinkIcon } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChurchPosterGeneratorProps {
  igreja: {
    id: string;
    nome_fantasia: string;
    logo_url: string | null;
    endereco: string | null;
    cidade: string | null;
    estado: string | null;
    telefone: string | null;
    email: string | null;
    pastor_presidente_nome: string | null;
  };
  registrationLink: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ChurchPosterGenerator({ igreja, registrationLink, open, onOpenChange, trigger }: ChurchPosterGeneratorProps) {
  const posterRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = posterRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cartaz - ${igreja.nome_fantasia}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
              font-family: 'Inter', sans-serif;
              background: white;
              display: flex;
              justify-content: center;
              padding: 20px;
            }
            
            .poster {
              width: 210mm;
              min-height: 297mm;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
              color: white;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .poster::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
              pointer-events: none;
            }
            
            .content { position: relative; z-index: 1; width: 100%; }
            
            .header { margin-bottom: 30px; }
            
            .logo {
              width: 120px;
              height: 120px;
              border-radius: 20px;
              object-fit: cover;
              border: 4px solid rgba(255,255,255,0.2);
              margin-bottom: 20px;
            }
            
            .logo-placeholder {
              width: 120px;
              height: 120px;
              border-radius: 20px;
              background: linear-gradient(135deg, #c9a227 0%, #d4af37 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 48px;
              font-weight: bold;
              color: #1a1a2e;
            }
            
            .church-name {
              font-family: 'Playfair Display', serif;
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 10px;
              color: #d4af37;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .divider {
              width: 100px;
              height: 3px;
              background: linear-gradient(90deg, transparent, #d4af37, transparent);
              margin: 20px auto;
            }
            
            .cta-title {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 10px;
              color: white;
            }
            
            .cta-subtitle {
              font-size: 18px;
              color: rgba(255,255,255,0.8);
              margin-bottom: 30px;
              max-width: 400px;
              margin-left: auto;
              margin-right: auto;
            }
            
            .qr-container {
              background: white;
              padding: 20px;
              border-radius: 20px;
              margin: 20px auto;
              display: inline-block;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            
            .scan-text {
              font-size: 14px;
              color: rgba(255,255,255,0.7);
              margin-top: 20px;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            
            .info-section {
              margin-top: 30px;
              padding: 20px;
              background: rgba(255,255,255,0.1);
              border-radius: 15px;
              backdrop-filter: blur(10px);
            }
            
            .info-item {
              margin: 10px 0;
              font-size: 14px;
              color: rgba(255,255,255,0.9);
            }
            
            .info-label {
              color: #d4af37;
              font-weight: 600;
              margin-right: 5px;
            }
            
            .pastor-section {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid rgba(255,255,255,0.2);
            }
            
            .pastor-label {
              font-size: 12px;
              color: rgba(255,255,255,0.6);
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .pastor-name {
              font-size: 18px;
              font-weight: 600;
              color: #d4af37;
              margin-top: 5px;
            }
            
            .footer {
              margin-top: auto;
              padding-top: 30px;
              font-size: 11px;
              color: rgba(255,255,255,0.5);
            }
            
            @media print {
              body { padding: 0; }
              .poster { 
                width: 100%; 
                min-height: 100vh;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleDownloadImage = async () => {
    if (!posterRef.current) return;

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `cartaz-${igreja.nome_fantasia.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    toast.success("Link copiado!", {
      description: "O link de cadastro foi copiado para sua área de transferência."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      {!trigger && !onOpenChange && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <FileImage className="h-4 w-4 mr-2" />
            Gerar Cartaz
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Compartilhar e Imprimir</DialogTitle>
        </DialogHeader>

        {/* Link Sharing Section */}
        <div className="bg-muted/50 p-4 rounded-lg mb-6 border border-border">
          <Label className="mb-2 block font-medium">Link Externo para Cadastro</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={registrationLink}
                readOnly
                className="pl-9 bg-background font-mono text-sm"
              />
            </div>
            <Button onClick={handleCopyLink} variant="default" className="shrink-0">
              <Copy className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Envie este link para os membros se cadastrarem diretamente.
          </p>
        </div>

        <div className="flex gap-4 mb-4">
          <Button onClick={handlePrint} variant="gold" className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Cartaz com QR Code
          </Button>
          <Button onClick={handleDownloadImage} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Baixar Imagem
          </Button>
        </div>

        {/* Poster Preview */}
        <div className="flex justify-center bg-muted p-4 rounded-lg overflow-auto border border-border">
          <div
            ref={posterRef}
            className="poster"
            style={{
              width: "210mm",
              minHeight: "297mm",
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              color: "white",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <div className="content" style={{ position: "relative", zIndex: 1, width: "100%" }}>
              {/* Header */}
              <div className="header">
                {igreja.logo_url ? (
                  <img
                    src={igreja.logo_url}
                    alt={igreja.nome_fantasia}
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "20px",
                      objectFit: "cover",
                      border: "4px solid rgba(255,255,255,0.2)",
                      margin: "0 auto 20px",
                      display: "block",
                    }}
                  />
                ) : (
                  <div style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #c9a227 0%, #d4af37 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#1a1a2e",
                  }}>
                    {igreja.nome_fantasia.charAt(0)}
                  </div>
                )}

                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "32px",
                  fontWeight: 700,
                  marginBottom: "10px",
                  color: "#d4af37",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}>
                  {igreja.nome_fantasia}
                </h1>
              </div>

              {/* Divider */}
              <div style={{
                width: "100px",
                height: "3px",
                background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
                margin: "20px auto",
              }} />

              {/* CTA */}
              <h2 style={{
                fontSize: "28px",
                fontWeight: 700,
                marginBottom: "10px",
                color: "white",
              }}>
                Faça Parte da Nossa Igreja!
              </h2>
              <p style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.8)",
                marginBottom: "30px",
                maxWidth: "400px",
                marginLeft: "auto",
                marginRight: "auto",
              }}>
                Escaneie o QR Code abaixo para se cadastrar como membro
              </p>

              {/* QR Code */}
              <div style={{
                background: "white",
                padding: "20px",
                borderRadius: "20px",
                margin: "20px auto",
                display: "inline-block",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              }}>
                <QRCodeSVG
                  value={registrationLink}
                  size={200}
                  level="H"
                  includeMargin={false}
                  imageSettings={igreja.logo_url ? {
                    src: igreja.logo_url,
                    x: undefined,
                    y: undefined,
                    height: 45,
                    width: 45,
                    excavate: true,
                  } : undefined}
                />
              </div>

              <p style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.7)",
                marginTop: "20px",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}>
                Aponte a câmera do celular
              </p>

              {/* Info Section */}
              <div style={{
                marginTop: "30px",
                padding: "20px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "15px",
              }}>
                {igreja.endereco && (
                  <p style={{ margin: "10px 0", fontSize: "14px", color: "rgba(255,255,255,0.9)" }}>
                    <span style={{ color: "#d4af37", fontWeight: 600 }}>Endereço:</span> {igreja.endereco}
                  </p>
                )}
                {(igreja.cidade || igreja.estado) && (
                  <p style={{ margin: "10px 0", fontSize: "14px", color: "rgba(255,255,255,0.9)" }}>
                    <span style={{ color: "#d4af37", fontWeight: 600 }}>Cidade:</span> {[igreja.cidade, igreja.estado].filter(Boolean).join(" - ")}
                  </p>
                )}
                {igreja.telefone && (
                  <p style={{ margin: "10px 0", fontSize: "14px", color: "rgba(255,255,255,0.9)" }}>
                    <span style={{ color: "#d4af37", fontWeight: 600 }}>Telefone:</span> {igreja.telefone}
                  </p>
                )}
                {igreja.email && (
                  <p style={{ margin: "10px 0", fontSize: "14px", color: "rgba(255,255,255,0.9)" }}>
                    <span style={{ color: "#d4af37", fontWeight: 600 }}>E-mail:</span> {igreja.email}
                  </p>
                )}

                {igreja.pastor_presidente_nome && (
                  <div style={{
                    marginTop: "20px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                  }}>
                    <p style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}>
                      Pastor Presidente
                    </p>
                    <p style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#d4af37",
                      marginTop: "5px",
                    }}>
                      {igreja.pastor_presidente_nome}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: "auto",
              paddingTop: "30px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.5)",
            }}>
              Sistema SISCOF - Gestão de Igrejas
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}