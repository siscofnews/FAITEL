import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function PrintAuthorization({ movement }: { movement: any }) {
  const createdAt = useMemo(() => new Date(movement?.created_at || Date.now()).toLocaleString("pt-BR"), [movement]);
  return (
    <div style={{ width: "21cm", padding: "2cm", fontSize: 12 }}>
      <style>{`@media print{.no-print{display:none}}`}</style>
      <header style={{ textAlign: "center" }}>
        <h3>Autorização</h3>
      </header>
      <section>
        <p>Protocolo: {movement?.protocol_code}</p>
        <p>Data: {createdAt}</p>
        <p>Bem: {movement?.asset_name} ({movement?.asset_code})</p>
        <p>Quantidade: {movement?.quantity}</p>
        <p>Destino: {movement?.destination}</p>
      </section>
      <div className="no-print" style={{ marginTop: 16 }}>
        <Button onClick={() => window.print()}>Exportar PDF</Button>
      </div>
      <section style={{ marginTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <p>__________________________________</p>
            <p>Assinatura do Pastor</p>
          </div>
          <div>
            <p>__________________________________</p>
            <p>Assinatura do Recebedor</p>
          </div>
        </div>
      </section>
    </div>
  );
}

