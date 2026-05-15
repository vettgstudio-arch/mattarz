import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Settings() {
  const [companyData, setCompanyData] = useState({
    companyName: "",
    cnpj: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    website: "",
  });

  const FIXED_CATEGORIES = [
    { id: 1, name: "Celular" },
    { id: 2, name: "Fone" },
    { id: 3, name: "Carregador" },
    { id: 4, name: "Notebook" },
    { id: 5, name: "Outros" },
  ];

  const companySettings = trpc.settings.getCompany.useQuery();
  const updateCompany = trpc.settings.updateCompany.useMutation();

  useEffect(() => {
    if (companySettings.data) {
      setCompanyData({
        companyName: companySettings.data.companyName || "",
        cnpj: companySettings.data.cnpj || "",
        phone: companySettings.data.phone || "",
        email: companySettings.data.email || "",
        address: companySettings.data.address || "",
        city: companySettings.data.city || "",
        state: companySettings.data.state || "",
        zipCode: companySettings.data.zipCode || "",
        website: companySettings.data.website || "",
      });
    }
  }, [companySettings.data]);

  const handleSaveCompany = async () => {
    try {
      await updateCompany.mutateAsync(companyData);
      toast.success("Dados da empresa atualizados com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar dados da empresa");
    }
  };



  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuracoes</h1>
          <p className="text-muted-foreground mt-1">Gerencie as configuracoes da sua empresa</p>
        </div>

        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
          </TabsList>

          {/* Company Settings Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Informacoes da Empresa</CardTitle>
                <CardDescription>
                  Atualize os dados da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="company-name">Nome da Empresa *</Label>
                  <Input
                    id="company-name"
                    value={companyData.companyName}
                    onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                    placeholder="Mattarzinvestimentos"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={companyData.cnpj}
                      onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      placeholder="(11) 3000-0000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                    placeholder="contato@mattarz.com"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Endereco</Label>
                  <Input
                    id="address"
                    value={companyData.address}
                    onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                    placeholder="Rua, numero, complemento"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={companyData.city}
                      onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                      placeholder="Sao Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={companyData.state}
                      onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })}
                      placeholder="SP"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">CEP</Label>
                    <Input
                      id="zip"
                      value={companyData.zipCode}
                      onChange={(e) => setCompanyData({ ...companyData, zipCode: e.target.value })}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companyData.website}
                    onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                    placeholder="https://www.mattarz.com"
                  />
                </div>

                <Button onClick={handleSaveCompany} className="w-full">
                  Salvar Alteracoes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </div>
    </DashboardLayout>
  );
}
