import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertCircle, TrendingUp, Package, ShoppingCart, DollarSign, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import NotificationsCard from "@/components/NotificationsCard";
import ProfitDetailsModal from "@/components/ProfitDetailsModal";
import InvestmentDetailsModal from "@/components/InvestmentDetailsModal";
import TransactionModal from "@/components/TransactionModal";

export default function Home() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [salesLast7Days, setSalesLast7Days] = useState<any[]>([]);
  const [profitLast7Days, setProfitLast7Days] = useState<any[]>([]);
  const [salesToday, setSalesToday] = useState<any[]>([]);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [isReceivedModalOpen, setIsReceivedModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const dashboardStats = trpc.dashboard.getStats.useQuery();
  const profitDetails = trpc.dashboard.getProfitDetailsToday.useQuery();
  const investmentDetails = trpc.dashboard.getInvestmentDetails.useQuery();
  const receivedDetails = trpc.dashboard.getReceivedDetails.useQuery();
  const salesLast7DaysQuery = trpc.dashboard.getSalesLast7Days.useQuery();
  const profitLast7DaysQuery = trpc.dashboard.getProfitLast7Days.useQuery();
  const salesTodayQuery = trpc.dashboard.getSalesTodayWithDetails.useQuery();

  useEffect(() => {
    if (dashboardStats.data) {
      setStats(dashboardStats.data);
    }
  }, [dashboardStats.data]);

  useEffect(() => {
    if (salesLast7DaysQuery.data) {
      setSalesLast7Days(salesLast7DaysQuery.data || []);
    }
  }, [salesLast7DaysQuery.data]);

  useEffect(() => {
    if (profitLast7DaysQuery.data) {
      setProfitLast7Days(profitLast7DaysQuery.data || []);
    }
  }, [profitLast7DaysQuery.data]);

  useEffect(() => {
    if (salesTodayQuery.data) {
      setSalesToday(salesTodayQuery.data || []);
    }
  }, [salesTodayQuery.data]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold tracking-tight">Mattarzinvestimentos</h1>
          <p className="text-foreground/60">Bem-vindo de volta, {user?.name}! Aqui está o resumo do seu negócio.</p>
        </div>

        {/* Stats Cards - Principais Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Dinheiro no Caixa */}
          <Card 
            className="border-border/50 hover:border-primary/50 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group bg-primary/5"
            onClick={() => setIsTransactionModalOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70 group-hover:text-primary transition-colors">Dinheiro no Caixa</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${parseFloat(stats?.cashOnHand || 0) >= 0 ? "text-primary" : "text-red-500"}`}>
                {stats ? `R$ ${parseFloat(stats.cashOnHand || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : "R$ 0,00"}
              </div>
              <p className="text-xs text-foreground/50 mt-2 flex items-center gap-1">
                Gerenciar Capital/Fluxo <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>

          {/* Total Investido */}
          <Card 
            className="border-border/50 hover:border-blue-500/50 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group"
            onClick={() => setIsInvestmentModalOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70 group-hover:text-blue-500 transition-colors">Total Investido</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {stats ? `R$ ${parseFloat(stats.totalInvested || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : "R$ 0,00"}
              </div>
              <p className="text-xs text-foreground/50 mt-2 flex items-center gap-1">
                Estoque: R$ {stats ? parseFloat(stats.totalReplenishmentCost || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : "0,00"}
              </p>
            </CardContent>
          </Card>

          {/* Valor Recebido */}
          <Card 
            className="border-border/50 hover:border-green-500/50 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group"
            onClick={() => setIsReceivedModalOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70 group-hover:text-green-500 transition-colors">Total Recebido</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {stats ? `R$ ${parseFloat(stats.totalReceived || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : "R$ 0,00"}
              </div>
              <p className="text-sm text-foreground/60 mt-2 flex items-center gap-1">
                de R$ {stats ? `${parseFloat(stats.totalToReceive || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : "0,00"} <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              {stats?.pendingInstallmentsCount > 0 && (
                <p className="text-xs text-amber-500 mt-1">
                  {stats.pendingInstallmentsCount} parcela{stats.pendingInstallmentsCount !== 1 ? "s" : ""} pendente{stats.pendingInstallmentsCount !== 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Lucro Total */}
          <Card 
            className="border-border/50 hover:border-purple-500/50 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group"
            onClick={() => setIsProfitModalOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70 group-hover:text-purple-500 transition-colors">Lucro Total</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {stats ? `R$ ${parseFloat(stats.totalProfit || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : "R$ 0,00"}
              </div>
              <p className="text-xs text-foreground/50 mt-2 flex items-center gap-1">
                Clique para ver detalhes <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Card */}
        <NotificationsCard />



        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart - Últimos 7 dias */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Vendas por Dia</CardTitle>
              <CardDescription>Evolução de vendas (Últimos 7 dias)</CardDescription>
            </CardHeader>
            <CardContent>
              {salesLast7Days && salesLast7Days.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesLast7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="day" 
                      stroke="var(--color-foreground)" 
                      opacity={0.5}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="var(--color-foreground)" 
                      opacity={0.5}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.5rem"
                      }}
                      formatter={(value: any) => `R$ ${parseFloat(value).toFixed(2)}`}
                    />
                    <Bar dataKey="sales" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhuma venda nos últimos 7 dias
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profit Chart - Últimos 7 dias */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Lucro vs Custo</CardTitle>
              <CardDescription>Comparativo dos últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {profitLast7Days && profitLast7Days.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={profitLast7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="var(--color-foreground)" 
                      opacity={0.5}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="var(--color-foreground)" 
                      opacity={0.5}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.5rem"
                      }}
                      formatter={(value: any) => `R$ ${parseFloat(value).toFixed(2)}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="custo" 
                      stroke="#ef4444" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                      name="Custo"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lucro" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                      name="Lucro"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhum dado disponível nos últimos 7 dias
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modais de Detalhamento */}
        <ProfitDetailsModal 
          open={isProfitModalOpen} 
          onOpenChange={setIsProfitModalOpen} 
          profitData={profitDetails.data || null} 
        />
        
        <InvestmentDetailsModal
          open={isInvestmentModalOpen}
          onOpenChange={setIsInvestmentModalOpen}
          investmentData={investmentDetails.data || null}
        />

        {/* Transaction/Cash Management Modal */}
        <TransactionModal 
          open={isTransactionModalOpen}
          onOpenChange={setIsTransactionModalOpen}
          onSuccess={() => {
            dashboardStats.refetch();
          }}
        />

        {/* Received Details Modal */}
        <Dialog open={isReceivedModalOpen} onOpenChange={setIsReceivedModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
            <DialogHeader>
              <DialogTitle>Detalhamento de Recebimentos</DialogTitle>
              <DialogDescription>
                Total recebido: R$ {receivedDetails.data?.totalReceived.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || '0,00'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {receivedDetails.data?.items && receivedDetails.data.items.length > 0 ? (
                receivedDetails.data.items.map((item: any, index: number) => (
                  <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-all hover:scale-[1.01] cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {item.type === 'cash' ? `Venda #${item.saleId} - ${item.paymentMethod === 'cash' ? 'Dinheiro' : item.paymentMethod === 'card' ? 'Cartão' : 'Transferência/PIX'}` : `Parcela ${item.installmentNumber}/${item.totalInstallments} - Venda #${item.saleId}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.type === 'cash' ? new Date(item.date).toLocaleDateString('pt-BR') : new Date(item.paidDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <p className="font-bold text-green-500">R$ {item.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum recebimento registrado</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Últimas Vendas do Dia</CardTitle>
            <CardDescription>Vendas realizadas hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesToday && salesToday.length > 0 ? salesToday.slice(0, 5).map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-card/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold">Venda #{sale.id}</p>
                    <p className="text-sm text-foreground/60">Cliente: {sale.customer?.name || "Desconhecido"}</p>
                    <p className="text-xs text-foreground/50 mt-1">
                      {sale.items?.length || 0} item(ns) | {sale.paymentMethod === "installments" ? "Parcelado" : "À vista"}
                    </p>
                    {sale.paymentMethod === "installments" && (() => {
                      const installments = sale.installments_list || [];
                      const paidCount = installments.filter((i: any) => i.status === "paid").length;
                      return (
                        <p className="text-xs text-foreground/50 mt-1">
                          Parcelas Pagas: {paidCount}/{installments.length}
                        </p>
                      );
                    })()}
                  </div>
                  <div className="text-right">
                    {(() => {
                      if (sale.paymentMethod !== "installments") {
                        return (
                          <div>
                            <p className="font-bold text-green-500">R$ {parseFloat(sale.finalAmount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                            <p className="text-xs text-foreground/50 mt-1">Recebido / Total</p>
                          </div>
                        );
                      }
                      
                      const installments = sale.installments_list || [];
                      const paidAmount = installments.filter((i: any) => i.status === "paid").reduce((sum: number, i: any) => sum + parseFloat(i.amount || 0), 0);
                      const totalAmount = parseFloat(sale.finalAmount);
                      
                      return (
                        <div>
                          <p className="text-xs text-foreground/50">Recebido / Total</p>
                          <p className="font-bold text-green-500 text-sm">R$ {paidAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})} / R$ {totalAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        </div>
                      );
                    })()}
                    {(() => {
                      if (sale.paymentMethod !== "installments") {
                        return (
                          <Badge className="mt-2 bg-green-500/20 text-green-500 hover:bg-green-500/30">
                            Recebido
                          </Badge>
                        );
                      }
                      
                      // Para parcelados, verificar se todas as parcelas estão pagas
                      const installments = sale.installments_list || [];
                      const allPaid = installments.length > 0 && installments.every((i: any) => i.status === "paid");
                      const hasOverdue = installments.some((i: any) => i.status === "overdue" || (i.status === "pending" && new Date(i.dueDate) < new Date()));
                      
                      if (allPaid) {
                        return (
                          <Badge className="mt-2 bg-green-500/20 text-green-500 hover:bg-green-500/30">
                            Recebido
                          </Badge>
                        );
                      } else if (hasOverdue) {
                        return (
                          <Badge className="mt-2 bg-red-500/20 text-red-500 hover:bg-red-500/30">
                            Vencido
                          </Badge>
                        );
                      } else {
                        return (
                          <Badge className="mt-2 bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">
                            Pendente
                          </Badge>
                        );
                      }
                    })()}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma venda registrada hoje</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
