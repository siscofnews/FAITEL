import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Church, User, MapPin, Phone, Mail, Calendar, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PhotoUpload } from "@/components/PhotoUpload";

interface Church {
  id: string;
  nome_fantasia: string;
  nivel: string;
  parent_church_id: string | null;
}

export default function CadastroMembro() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Get church ID from generic 'igreja' param or legacy 'matriz' param
  const urlChurchId = searchParams.get("igreja") || searchParams.get("matriz");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMatriz, setSelectedMatriz] = useState<string>("");
  const [selectedSede, setSelectedSede] = useState<string>("");
  const [selectedSubsede, setSelectedSubsede] = useState<string>("");
  const [selectedCongregacao, setSelectedCongregacao] = useState<string>("");
  const [selectedCelula, setSelectedCelula] = useState<string>("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    birth_date: "",
    gender: "",
    marital_status: "",
    address: "",
    city: "",
    state: "",
    cep: "",
    role: "Membro",
    photo_url: "",
  });

  // Fetch URL Church Details (The anchor point of the hierarchy)
  const { data: urlChurch } = useQuery({
    queryKey: ["church-details-public", urlChurchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, nivel, logo_url")
        .eq("id", urlChurchId)
        .eq("is_approved", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!urlChurchId,
  });

  // Initialize selection based on URL Church Level
  useEffect(() => {
    if (urlChurch) {
      if (urlChurch.nivel === 'matriz') setSelectedMatriz(urlChurch.id);
      else if (urlChurch.nivel === 'sede') setSelectedSede(urlChurch.id);
      else if (urlChurch.nivel === 'subsede') setSelectedSubsede(urlChurch.id);
      else if (urlChurch.nivel === 'congregacao') setSelectedCongregacao(urlChurch.id);
      else if (urlChurch.nivel === 'celula') setSelectedCelula(urlChurch.id);
    }
  }, [urlChurch]);

  // QUERY: Matrizes (Root Level) - Only fetch if we are NOT locked to a sub-level
  const { data: matrizes } = useQuery({
    queryKey: ["matrizes-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, nivel")
        .eq("nivel", "matriz")
        .eq("is_approved", true)
        .eq("is_active", true)
        .order("nome_fantasia");
      if (error) throw error;
      return data as Church[];
    },
    enabled: !urlChurchId, // Only show root list if no link was provided
  });

  // QUERY: Sedes (Children of Selected Matriz)
  const { data: sedes } = useQuery({
    queryKey: ["sedes", selectedMatriz],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, nivel")
        .eq("parent_church_id", selectedMatriz)
        .eq("nivel", "sede")
        .eq("is_approved", true)
        .eq("is_active", true)
        .order("nome_fantasia");
      if (error) throw error;
      return data as Church[];
    },
    enabled: !!selectedMatriz,
  });

  // QUERY: Subsedes (Children of Selected Sede)
  const { data: subsedes } = useQuery({
    queryKey: ["subsedes", selectedSede],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, nivel")
        .eq("parent_church_id", selectedSede)
        .eq("nivel", "subsede")
        .eq("is_approved", true)
        .eq("is_active", true)
        .order("nome_fantasia");
      if (error) throw error;
      return data as Church[];
    },
    enabled: !!selectedSede,
  });

  // QUERY: Congregações (Children of Selected Subsede)
  const { data: congregacoes } = useQuery({
    queryKey: ["congregacoes", selectedSubsede],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, nivel")
        .eq("parent_church_id", selectedSubsede)
        .eq("nivel", "congregacao")
        .eq("is_approved", true)
        .eq("is_active", true)
        .order("nome_fantasia");
      if (error) throw error;
      return data as Church[];
    },
    enabled: !!selectedSubsede,
  });

  // Determine the selected primary church unit (Hierarchy Base)
  // We explicitly EXCLUDE cells here because they are selected separately now.
  const getSelectedChurchUnitId = () => {
    if (selectedCongregacao) return selectedCongregacao;
    if (selectedSubsede) return selectedSubsede;
    if (selectedSede) return selectedSede;
    if (selectedMatriz) return selectedMatriz;
    return "";
  };

  const selectedUnitId = getSelectedChurchUnitId();

  // Buscar células vinculadas à unidade selecionada (Matriz, Sede, Subsede ou Congregação)
  const { data: celulas } = useQuery({
    queryKey: ["celulas-unit", selectedUnitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("id, nome_fantasia, nivel")
        .eq("parent_church_id", selectedUnitId)
        .eq("nivel", "celula")
        .eq("is_approved", true)
        .eq("is_active", true)
        .order("nome_fantasia");
      if (error) throw error;
      return data as Church[];
    },
    enabled: !!selectedUnitId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // The final assigned ID is the Cell (if selected) OR the Church Unit
    const churchId = selectedCelula || selectedUnitId;

    if (!churchId) {
      toast.error("Selecione sua igreja");
      return;
    }

    if (!formData.full_name.trim()) {
      toast.error("Nome completo é obrigatório");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("members").insert({
        church_id: churchId,
        full_name: formData.full_name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
        marital_status: formData.marital_status || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        cep: formData.cep.trim() || null,
        role: formData.role,
        is_active: true,
        baptized: false,
        photo_url: formData.photo_url || null,
      });

      if (error) throw error;

      toast.success("Cadastro realizado com sucesso!");
      navigate("/cadastro-sucesso");
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      toast.error("Erro ao realizar cadastro: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-preencher CEP
  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            address: data.logradouro || prev.address,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  if (urlChurchId && !urlChurch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            {urlChurch?.logo_url && (
              <img src={urlChurch.logo_url} alt="Logo" className="h-20 w-20 mx-auto object-contain" />
            )}
            <div>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Church className="h-6 w-6 text-primary" />
                Cadastro de Membro
              </CardTitle>
              <CardDescription className="mt-2">
                {urlChurch
                  ? `Cadastre-se na ${urlChurch.nome_fantasia}`
                  : "Preencha seus dados para se cadastrar na igreja"
                }
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção de Igreja na Hierarquia */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium flex items-center gap-2">
                  <Church className="h-4 w-4" />
                  Selecione sua Igreja
                </h3>

                {/* LOGIC: 
                    Levels: Matriz(0) -> Sede(1) -> Subsede(2) -> Congregação(3) -> Célula(4)
                    
                    If URL has a church (urlLevel >= 0):
                      - For the exact level (index == urlLevel): Show READONLY.
                      - For levels ABOVE (index < urlLevel): Show NOTHING (Hidden context).
                      - For levels BELOW (index > urlLevel): Show SELECT (Normal drilling).
                    
                    If URL has NO church (urlLevel == -1):
                      - Show SELECT for Matriz.
                      - Show SELECT for children as they are picked.
                */}

                {(() => {
                  const levels = ['matriz', 'sede', 'subsede', 'congregacao', 'celula'];
                  const urlLevelIndex = urlChurch ? levels.indexOf(urlChurch.nivel) : -1;

                  return (
                    <>
                      {/* MATRIZ (0) */}
                      {urlLevelIndex === 0 && (
                        <div>
                          <Label>Matriz</Label>
                          <Input value={urlChurch?.nome_fantasia} disabled className="bg-muted" />
                        </div>
                      )}
                      {urlLevelIndex < 0 && (
                        <div>
                          <Label>Matriz *</Label>
                          <Select value={selectedMatriz} onValueChange={(v) => {
                            setSelectedMatriz(v);
                            setSelectedSede("");
                            setSelectedSubsede("");
                            setSelectedCongregacao("");
                            setSelectedCelula("");
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a matriz" />
                            </SelectTrigger>
                            <SelectContent>
                              {matrizes?.filter(m => !!m.id && String(m.id).trim() !== "").map((m) => (
                                <SelectItem key={m.id} value={String(m.id)}>{m.nome_fantasia}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* SEDE (1) */}
                      {urlLevelIndex === 1 && (
                        <div>
                          <Label>Sede</Label>
                          <Input value={urlChurch?.nome_fantasia} disabled className="bg-muted" />
                        </div>
                      )}
                      {urlLevelIndex < 1 && selectedMatriz && sedes && sedes.length > 0 && (
                        <div>
                          <Label>Sede (opcional)</Label>
                          <Select value={selectedSede} onValueChange={(v) => {
                            setSelectedSede(v === "_none" ? "" : v);
                            setSelectedSubsede("");
                            setSelectedCongregacao("");
                            setSelectedCelula("");
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a sede (se aplicável)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_none">Nenhuma (direto na matriz)</SelectItem>
                              {sedes?.filter(s => !!s.id && String(s.id).trim() !== "").map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>{s.nome_fantasia}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* SUBSEDE (2) */}
                      {urlLevelIndex === 2 && (
                        <div>
                          <Label>Subsede</Label>
                          <Input value={urlChurch?.nome_fantasia} disabled className="bg-muted" />
                        </div>
                      )}
                      {urlLevelIndex < 2 && selectedSede && subsedes && subsedes.length > 0 && (
                        <div>
                          <Label>Subsede (opcional)</Label>
                          <Select value={selectedSubsede} onValueChange={(v) => {
                            setSelectedSubsede(v === "_none" ? "" : v);
                            setSelectedCongregacao("");
                            setSelectedCelula("");
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a subsede (se aplicável)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_none">Nenhuma (direto na sede)</SelectItem>
                              {subsedes?.filter(s => !!s.id && String(s.id).trim() !== "").map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>{s.nome_fantasia}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* CONGREGAÇÃO (3) */}
                      {urlLevelIndex === 3 && (
                        <div>
                          <Label>Congregação</Label>
                          <Input value={urlChurch?.nome_fantasia} disabled className="bg-muted" />
                        </div>
                      )}
                      {urlLevelIndex < 3 && selectedSubsede && congregacoes && congregacoes.length > 0 && (
                        <div>
                          <Label>Congregação (opcional)</Label>
                          <Select value={selectedCongregacao} onValueChange={(v) => {
                            setSelectedCongregacao(v === "_none" ? "" : v);
                            setSelectedCelula("");
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a congregação (se aplicável)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_none">Nenhuma (direto na subsede)</SelectItem>
                              {congregacoes?.filter(c => !!c.id && String(c.id).trim() !== "").map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.nome_fantasia}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* CÉLULA (4) */}
                      {urlLevelIndex === 4 && (
                        <div>
                          <Label>Célula</Label>
                          <Input value={urlChurch?.nome_fantasia} disabled className="bg-muted" />
                        </div>
                      )}
                      {urlLevelIndex < 4 && selectedCongregacao && celulas && celulas.length > 0 && (
                        <div>
                          <Label>Célula (opcional)</Label>
                          <Select value={selectedCelula} onValueChange={(v) => setSelectedCelula(v === "_none" ? "" : v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a célula (se aplicável)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_none">Nenhuma (direto na congregação)</SelectItem>
                              {celulas?.filter(c => !!c.id && String(c.id).trim() !== "").map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.nome_fantasia}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Foto do Membro */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Foto do Membro
                </h3>
                <PhotoUpload
                  onPhotoUploaded={(url) => handleInputChange("photo_url", url)}
                  currentPhotoUrl={formData.photo_url}
                  bucket="member-photos"
                  required={true}
                />
              </div>

              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dados Pessoais
                </h3>

                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Telefone
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Data de Nascimento
                    </Label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange("birth_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Sexo</Label>
                    <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estado Civil</Label>
                    <Select value={formData.marital_status} onValueChange={(v) => handleInputChange("marital_status", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                        <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Função na Igreja</Label>
                  <Select value={formData.role} onValueChange={(v) => handleInputChange("role", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Membro">Membro</SelectItem>
                      <SelectItem value="Obreiro">Obreiro</SelectItem>
                      <SelectItem value="Diácono">Diácono</SelectItem>
                      <SelectItem value="Diaconisa">Diaconisa</SelectItem>
                      <SelectItem value="Presbítero">Presbítero</SelectItem>
                      <SelectItem value="Evangelista">Evangelista</SelectItem>
                      <SelectItem value="Missionário">Missionário</SelectItem>
                      <SelectItem value="Missionária">Missionária</SelectItem>
                      <SelectItem value="Pastor">Pastor</SelectItem>
                      <SelectItem value="Pastora">Pastora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>CEP</Label>
                    <Input
                      value={formData.cep}
                      onChange={(e) => handleInputChange("cep", e.target.value)}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Endereço</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Rua, número, bairro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Sua cidade"
                    />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="UF"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || (!selectedMatriz && !urlChurchId)}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Realizar Cadastro"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-4">v1.5 - Sistema de Cadastro</p>
      </div>
    </div>
  );
}