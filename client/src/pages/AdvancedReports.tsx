import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, FileText, Mail, Calendar, TrendingUp, Users, Package, DollarSign } from "lucide-react";

export default function AdvancedReports() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedFormat, setSelectedFormat] = useState("pdf");

  const salesData = [
    { month: "Jan", total: 45000, target: 50000, actual: 42000 },
    { month: "Fev", total: 52000, target: 50000, actual: 51000 },
    { month: "Mar", total: 48000, target: 50000, actual: 47000 },
    { month: "Abr", total: 61000, target: 50000, actual: 60000 },
    { month: "Mai", total: 55000, target: 50000, actual: 54000 },
  ];

  const customerData = [
    { name: "Clientes Ativos", value: 245, fill: "#3b82f6" },
    { name: "Novos Clientes", value: 42, fill: "#10b981" },
    { name: "Inativos", value: 18, fill: "#ef4444" },
  ];

  const productPerformance = [
    { product: "Produto A", sales: 15000, margin: 35, trend: "up" },
    { product: "Produto B", sales: 12000, margin: 28, trend: "up" },
    { product: "Produto C", sales: 9500, margin: 22, trend: "down" },
    { product: "Produto D", sales: 8200, margin: 18, trend: "up" },
  ];

  const handleExport = () => {
    alert(`Exportando relatório em formato ${selectedFormat.toUpperCase()}...`);
  };

  const handleSchedule = () => {
    alert("Agendar relatório para envio automático por email");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Relatórios Avançados</h1>
            <p className="text-muted-foreground">Análise detalhada do seu negócio com múltiplas visualizações</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Ano</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>

            <Button variant="outline" onClick={handleSchedule} className="gap-2">
              <Mail className="h-4 w-4" />
              Agendar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 261.000</div>
              <p className="text-xs text-muted-foreground mt-1">+12% vs período anterior</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">26,3%</div>
              <p className="text-xs text-muted-foreground mt-1">+2.1% vs período anterior</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground mt-1">+17 novos este mês</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.245</div>
              <p className="text-xs text-muted-foreground mt-1">Em catálogo ativo</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Análise de Vendas</CardTitle>
                <CardDescription>Comparativo entre meta e realizado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="target" fill="#94a3b8" name="Meta" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Realizado" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Tendência de Vendas</CardTitle>
                <CardDescription>Evolução ao longo do período</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Distribuição de Clientes</CardTitle>
                  <CardDescription>Status de atividade</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={customerData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {customerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Valor por Cliente</CardTitle>
                  <CardDescription>Segmentação por faixa de valor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { range: "Acima de R$ 10.000", count: 12, percentage: 5 },
                      { range: "R$ 5.000 - R$ 10.000", count: 34, percentage: 14 },
                      { range: "R$ 1.000 - R$ 5.000", count: 89, percentage: 36 },
                      { range: "Até R$ 1.000", count: 110, percentage: 45 },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.range}</span>
                          <span className="text-muted-foreground">{item.count} clientes</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Performance de Produtos</CardTitle>
                <CardDescription>Top produtos por vendas e margem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productPerformance.map((product, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{product.product}</p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Vendas: R$ {product.sales.toLocaleString()}</span>
                          <span>Margem: {product.margin}%</span>
                        </div>
                      </div>
                      <Badge variant={product.trend === "up" ? "default" : "destructive"}>
                        {product.trend === "up" ? "↑ Alta" : "↓ Baixa"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export Options */}
        <Card className="shadow-elegant bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Opções de Exportação
            </CardTitle>
            <CardDescription>Configure relatórios automáticos e agendados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto flex-col py-4">
                <Download className="h-6 w-6 mb-2" />
                <span className="font-medium">Exportar Agora</span>
                <span className="text-xs text-muted-foreground">PDF, Excel, CSV</span>
              </Button>

              <Button variant="outline" className="h-auto flex-col py-4">
                <Calendar className="h-6 w-6 mb-2" />
                <span className="font-medium">Agendar Envio</span>
                <span className="text-xs text-muted-foreground">Diário, semanal, mensal</span>
              </Button>

              <Button variant="outline" className="h-auto flex-col py-4">
                <Mail className="h-6 w-6 mb-2" />
                <span className="font-medium">Enviar por Email</span>
                <span className="text-xs text-muted-foreground">Para múltiplos destinatários</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
