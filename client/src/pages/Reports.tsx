import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";

export default function Reports() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  const dashboardStats = trpc.dashboard.getStats.useQuery();
  const monthlySalesData = trpc.dashboard.getMonthlySalesData.useQuery({
    year: parseInt(selectedYear),
    month: parseInt(selectedMonth),
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Dados do banco de dados
  const monthlyData = monthlySalesData.data || [];
  const categoryData = [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Relatorios</h1>
          <p className="text-muted-foreground mt-1">Analise de vendas e lucros</p>
        </div>

        {/* Filters */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Ano</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Mes</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month.toString()}>
                      {new Date(2000, month - 1).toLocaleDateString("pt-BR", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button>Aplicar Filtros</Button>
            </div>
          </CardContent>
        </Card>

        {/* Revenue vs Cost Chart */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Receita vs Custo (Ultimos 7 Meses)</CardTitle>
            <CardDescription>Comparativo de receita e custo de produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="var(--color-primary)" name="Receita" />
                <Bar dataKey="cost" fill="#ef4444" name="Custo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Trend */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Tendencia de Lucro</CardTitle>
            <CardDescription>Evolucao do lucro liquido</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="var(--color-secondary)" strokeWidth={2} name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Vendas por Categoria</CardTitle>
              <CardDescription>Distribuicao de vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Resumo do Periodo</CardTitle>
              <CardDescription>Metricas principais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                <span className="font-medium">Receita Total</span>
                <span className="text-xl font-bold text-primary">R$ {monthlySalesData.data ? monthlySalesData.data.reduce((sum: number, s: any) => sum + parseFloat(s.finalAmount || 0), 0).toFixed(2) : "0,00"}</span>
              </div>
              <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                <span className="font-medium">Custo Total</span>
                <span className="text-xl font-bold text-destructive">R$ {monthlySalesData.data ? monthlySalesData.data.reduce((sum: number, s: any) => sum + parseFloat(s.totalAmount || 0), 0).toFixed(2) : "0,00"}</span>
              </div>
              <div className="flex justify-between items-center p-3 border border-border rounded-lg bg-secondary/10">
                <span className="font-medium">Lucro Liquido</span>
                <span className="text-xl font-bold text-secondary">R$ {monthlySalesData.data ? monthlySalesData.data.reduce((sum: number, s: any) => sum + (parseFloat(s.finalAmount || 0) - parseFloat(s.totalAmount || 0)), 0).toFixed(2) : "0,00"}</span>
              </div>
              <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                <span className="font-medium">Numero de Vendas</span>
                <span className="text-xl font-bold">{monthlySalesData.data?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                <span className="font-medium">Ticket Medio</span>
                <span className="text-xl font-bold">R$ {monthlySalesData.data && monthlySalesData.data.length > 0 ? (monthlySalesData.data.reduce((sum: number, s: any) => sum + parseFloat(s.finalAmount || 0), 0) / monthlySalesData.data.length).toFixed(2) : "0,00"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top 10 produtos do periodo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlySalesData.data && monthlySalesData.data.length > 0 ? monthlySalesData.data.slice(0, 5).map((sale: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">Venda #{sale.id}</p>
                    <p className="text-sm text-muted-foreground">{new Date(sale.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {parseFloat(sale.finalAmount).toFixed(2)}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma venda neste período</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
