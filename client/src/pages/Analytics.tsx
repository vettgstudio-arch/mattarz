import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ComposedChart } from "recharts";
import { TrendingUp, TrendingDown, Activity, Zap, Target, Award } from "lucide-react";

export default function Analytics() {
  const conversionData = [
    { week: "Sem 1", visits: 4000, conversions: 240, revenue: 24000 },
    { week: "Sem 2", visits: 3000, conversions: 221, revenue: 22100 },
    { week: "Sem 3", visits: 2000, conversions: 229, revenue: 22900 },
    { week: "Sem 4", visits: 2780, conversions: 200, revenue: 20000 },
    { week: "Sem 5", visits: 1890, conversions: 229, revenue: 22900 },
  ];

  const customerLifetimeValue = [
    { month: "Mês 1", ltv: 1200, cac: 150 },
    { month: "Mês 2", ltv: 1450, cac: 160 },
    { month: "Mês 3", ltv: 1680, cac: 155 },
    { month: "Mês 4", ltv: 1920, cac: 170 },
    { month: "Mês 5", ltv: 2150, cac: 165 },
  ];

  const churnData = [
    { month: "Jan", churnRate: 5.2, retention: 94.8 },
    { month: "Fev", churnRate: 4.8, retention: 95.2 },
    { month: "Mar", churnRate: 4.1, retention: 95.9 },
    { month: "Abr", churnRate: 3.5, retention: 96.5 },
    { month: "Mai", churnRate: 3.2, retention: 96.8 },
  ];

  const metrics = [
    { label: "Taxa de Conversão", value: "3.24%", change: "+0.45%", icon: Target, trend: "up" },
    { label: "Ticket Médio", value: "R$ 1.245", change: "+8.2%", icon: TrendingUp, trend: "up" },
    { label: "Retenção", value: "96.8%", change: "+1.2%", icon: Award, trend: "up" },
    { label: "Churn Rate", value: "3.2%", change: "-0.8%", icon: TrendingDown, trend: "down" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-gradient">Analytics Avançado</h1>
          <p className="text-muted-foreground">Métricas e insights detalhados sobre o desempenho do seu negócio</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <Card key={i} className="shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                  <Icon className={`h-4 w-4 ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className={`text-xs mt-1 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {metric.change} vs período anterior
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="conversion" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conversion">Conversão</TabsTrigger>
            <TabsTrigger value="ltv">LTV & CAC</TabsTrigger>
            <TabsTrigger value="retention">Retenção</TabsTrigger>
          </TabsList>

          <TabsContent value="conversion" className="space-y-4">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Funil de Conversão</CardTitle>
                <CardDescription>Visitantes, conversões e receita ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="visits" fill="#3b82f6" name="Visitantes" />
                    <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} name="Conversões" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Taxa de Conversão por Fonte</CardTitle>
                <CardDescription>Performance de cada canal de aquisição</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { source: "Google Ads", rate: 4.2, visitors: 1240 },
                    { source: "Facebook", rate: 3.1, visitors: 890 },
                    { source: "Email", rate: 5.8, visitors: 450 },
                    { source: "Orgânico", rate: 2.9, visitors: 2100 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.source}</p>
                        <p className="text-sm text-muted-foreground">{item.visitors} visitantes</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{item.rate}%</p>
                        <div className="w-32 bg-muted rounded-full h-2 mt-1">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${item.rate * 10}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ltv" className="space-y-4">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Customer Lifetime Value vs CAC</CardTitle>
                <CardDescription>Relação entre valor do cliente e custo de aquisição</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={customerLifetimeValue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="ltv" fill="#3b82f6" stroke="#3b82f6" name="LTV" />
                    <Area type="monotone" dataKey="cac" fill="#ef4444" stroke="#ef4444" name="CAC" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Índice LTV/CAC</CardTitle>
                <CardDescription>Proporção ideal: acima de 3:1</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-5xl font-bold text-primary mb-2">13:1</div>
                  <p className="text-muted-foreground">Proporção atual</p>
                  <p className="text-sm text-green-600 mt-4">✓ Excelente - Muito acima do ideal</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Taxa de Retenção</CardTitle>
                <CardDescription>Evolução da retenção de clientes ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={churnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={2} name="Taxa de Retenção %" />
                    <Line type="monotone" dataKey="churnRate" stroke="#ef4444" strokeWidth={2} name="Churn Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Segmentação de Clientes</CardTitle>
                <CardDescription>Análise por tempo de relacionamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { segment: "0-3 meses", count: 45, retention: 68 },
                    { segment: "3-6 meses", count: 78, retention: 82 },
                    { segment: "6-12 meses", count: 92, retention: 91 },
                    { segment: "1+ anos", count: 130, retention: 96 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.segment}</span>
                        <span className="text-muted-foreground">{item.count} clientes</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: `${item.retention}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{item.retention}% retenção</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
