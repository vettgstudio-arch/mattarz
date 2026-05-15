import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Clock, CreditCard, DollarSign, Filter, X } from "lucide-react";
import { toast } from "sonner";

export default function Receivables() {
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [notifications, setNotifications] = useState<any[]>([]);

  const utils = trpc.useUtils();
  const installments = trpc.installments.list.useQuery();
  const overdue = trpc.installments.getOverdue.useQuery();
  const customers = trpc.customers.list.useQuery();
  const updateStatus = trpc.installments.updateStatus.useMutation();
  const upcomingInstallments = trpc.dashboard.getUpcomingAndOverdueInstallments.useQuery();

  // Processar notificações
  useEffect(() => {
    if (upcomingInstallments.data) {
      const processed = upcomingInstallments.data.map((inst: any) => {
        const dueDate = new Date(inst.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let type = "upcoming";
        if (diffDays < 0) {
          type = "overdue";
        } else if (diffDays === 0) {
          type = "today";
        }
        
        return {
          ...inst,
          diffDays,
          type,
        };
      });
      
      setNotifications(processed);
    }
  }, [upcomingInstallments.data]);

  const handleMarkAsPaid = async (installmentId: number) => {
    try {
      await updateStatus.mutateAsync({
        id: installmentId,
        status: "paid",
        paymentMethod,
        paidDate: new Date(),
      });
      toast.success("Parcela marcada como paga");
      
      // Forçar atualização de todos os dados relacionados
      await Promise.all([
        installments.refetch(),
        overdue.refetch(),
        upcomingInstallments.refetch(),
        utils.dashboard.getStats.invalidate(),
        utils.dashboard.getSalesTodayWithDetails.invalidate(),
        utils.dashboard.getProfitDetailsToday.invalidate()
      ]);
      
      setOpenDialog(false);
    } catch (error) {
      toast.error("Erro ao atualizar parcela");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200">Pago</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200">Pendente</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200">Vencido</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "overdue":
        return "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300";
      case "today":
        return "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300";
      case "upcoming":
        return "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300";
      default:
        return "bg-gray-500/10 border-gray-500/30";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "today":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "upcoming":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const getTypeLabel = (type: string, days: number) => {
    switch (type) {
      case "overdue":
        return `Vencido há ${Math.abs(days)} dia${Math.abs(days) !== 1 ? "s" : ""}`;
      case "today":
        return "Vence hoje";
      case "upcoming":
        return `Vence em ${days} dia${days !== 1 ? "s" : ""}`;
      default:
        return "Pendente";
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.data?.find((c: any) => c.id === customerId);
    return customer ? customer.name : "Cliente Desconhecido";
  };

  // Filtrar parcelas
  const filteredInstallments = installments.data?.filter((inst: any) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "overdue") {
      return inst.status === "pending" && new Date(inst.dueDate) < new Date();
    }
    if (filterStatus === "pending") {
      return inst.status === "pending" && new Date(inst.dueDate) >= new Date();
    }
    return inst.status === filterStatus;
  }) || [];

  const totalPending = installments.data?.reduce((sum: number, inst: any) => {
    return inst.status === "pending" ? sum + parseFloat(inst.amount) : sum;
  }, 0) || 0;

  const totalOverdue = installments.data?.reduce((sum: number, inst: any) => {
    const isOverdue = inst.status === "pending" && new Date(inst.dueDate) < new Date();
    return isOverdue ? sum + parseFloat(inst.amount) : sum;
  }, 0) || 0;

  const totalPaid = installments.data?.reduce((sum: number, inst: any) => {
    return inst.status === "paid" ? sum + parseFloat(inst.amount) : sum;
  }, 0) || 0;

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const overdueCount = notifications.filter(n => n.type === "overdue").length;
  const todayCount = notifications.filter(n => n.type === "today").length;
  const upcomingCount = notifications.filter(n => n.type === "upcoming").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Contas a Receber</h1>
          <p className="text-muted-foreground mt-1">Gestão de parcelas e pagamentos</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-elegant border-none bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">R$ {totalPending.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Parcelas não pagas</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-none bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vencido</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">R$ {totalOverdue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
              <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Parcelas atrasadas</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-none bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">R$ {totalPaid.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Parcelas pagas</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-none bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Parcelas</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{installments.data?.length || 0}</div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Registradas no sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <Card className="border-orange-200/50 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-900/10 dark:to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <CardTitle className="text-lg">Notificações de Vencimento</CardTitle>
                    <CardDescription>Parcelas a vencer ou vencidas</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {overdueCount > 0 && (
                    <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
                      {overdueCount} Vencidas
                    </Badge>
                  )}
                  {todayCount > 0 && (
                    <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                      {todayCount} Hoje
                    </Badge>
                  )}
                  {upcomingCount > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                      {upcomingCount} Próximas
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${getNotificationColor(notification.type)} flex items-start gap-3 transition-all hover:shadow-md`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm">
                          Parcela {notification.installmentNumber}/{notification.totalInstallments}
                        </p>
                        <p className="text-xs font-bold whitespace-nowrap">
                          R$ {parseFloat(notification.amount).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-xs font-medium opacity-75">
                        {getTypeLabel(notification.type, notification.diffDays)}
                      </p>
                      <p className="text-xs opacity-60 mt-1">
                        Vencimento: {new Date(notification.dueDate).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-xs opacity-60">
                        Cliente: {getCustomerName(notification.customerId)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overdue Alert */}
        {overdue.data && overdue.data.length > 0 && (
          <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-4 flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-red-800 dark:text-red-300 font-semibold">⚠️ Atenção: Parcelas Vencidas</h3>
              <p className="text-red-700 dark:text-red-400 text-sm">
                Existem <strong>{overdue.data.length}</strong> parcela(s) com pagamento atrasado. Priorize a cobrança!
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="shadow-elegant border-none bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <CardTitle className="text-base">Filtros</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                Todas ({installments.data?.length || 0})
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("pending")}
                className={filterStatus === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                Pendentes ({installments.data?.filter((i: any) => i.status === "pending" && new Date(i.dueDate) >= new Date()).length || 0})
              </Button>
              <Button
                variant={filterStatus === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("paid")}
                className={filterStatus === "paid" ? "bg-green-500 hover:bg-green-600" : ""}
              >
                Pagas ({installments.data?.filter((i: any) => i.status === "paid").length || 0})
              </Button>
              <Button
                variant={filterStatus === "overdue" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("overdue")}
                className={filterStatus === "overdue" ? "bg-red-500 hover:bg-red-600" : ""}
              >
                Vencidas ({installments.data?.filter((i: any) => i.status === "pending" && new Date(i.dueDate) < new Date()).length || 0})
              </Button>
              {filterStatus !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className="ml-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Installments Grouped by Sale */}
        <Card className="shadow-elegant border-none bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Contas a Receber por Venda</CardTitle>
            <CardDescription>Total de {filteredInstallments.length} parcelas {filterStatus !== "all" ? `(${filterStatus})` : ""}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {installments.isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando parcelas...</div>
              ) : filteredInstallments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma parcela encontrada</div>
              ) : (
                Object.entries(
                  filteredInstallments.reduce((acc: any, inst: any) => {
                    const key = `${inst.saleId}-${inst.customerId}`;
                    if (!acc[key]) {
                      acc[key] = [];
                    }
                    acc[key].push(inst);
                    return acc;
                  }, {})
                ).map(([key, items]: [string, any]) => {
                  const firstItem = items[0];
                  const totalAmount = items.reduce((sum: number, i: any) => sum + parseFloat(i.amount), 0);
                  const paidAmount = items.filter((i: any) => i.status === "paid").reduce((sum: number, i: any) => sum + parseFloat(i.amount), 0);
                  const paidCount = items.filter((i: any) => i.status === "paid").length;
                  const totalCount = items.length;
                  const allPaid = paidCount === totalCount;
                  const hasOverdue = items.some((i: any) => i.status === "pending" && new Date(i.dueDate) <= new Date());
                  
                  return (
                    <div key={key} className="border border-border/50 rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base">Venda #{firstItem.saleId}</h3>
                            <Badge className={allPaid ? "bg-green-500/20 text-green-500" : hasOverdue ? "bg-red-500/20 text-red-500" : "bg-amber-500/20 text-amber-500"}>
                              {allPaid ? "Quitado" : hasOverdue ? "Vencido" : "Pendente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{getCustomerName(firstItem.customerId)}</p>
                          <p className="text-xs text-muted-foreground mt-1">Parcelas Pagas: {paidCount}/{totalCount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Recebido / Total</p>
                          <p className="text-lg font-bold text-green-500">R$ {paidAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})} / R$ {totalAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        </div>
                      </div>
                      
                      {/* Installments List */}
                      <div className="space-y-2 mt-3 pt-3 border-t border-border/30">
                        {items.map((inst: any) => {
                          const isOverdue = inst.status === "pending" && new Date(inst.dueDate) <= new Date();
                          return (
                            <div key={inst.id} className={`flex justify-between items-center p-2 rounded text-sm ${isOverdue ? "bg-red-50/50 dark:bg-red-900/20" : "bg-muted/30"}`}>
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-xs text-muted-foreground min-w-fit">Parcela {inst.installmentNumber}/{inst.totalInstallments}</span>
                                <span className="text-xs text-muted-foreground">{inst.dueDate ? new Date(inst.dueDate).toLocaleDateString("pt-BR") : "-"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">R$ {parseFloat(inst.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                {inst.status === "paid" ? (
                                  <Badge className="bg-green-500/20 text-green-500 text-xs">Pago</Badge>
                                ) : isOverdue ? (
                                  <Badge className="bg-red-500/20 text-red-500 text-xs">Vencido</Badge>
                                ) : (
                                  <Badge className="bg-amber-500/20 text-amber-500 text-xs">Pendente</Badge>
                                )}
                                {inst.status !== "paid" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs ml-2"
                                    onClick={() => {
                                      setSelectedInstallment(inst);
                                      setOpenDialog(true);
                                    }}
                                  >
                                    Baixar
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Baixa da parcela {selectedInstallment?.installmentNumber}/{selectedInstallment?.totalInstallments} de {getCustomerName(selectedInstallment?.customerId)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor da Parcela</p>
                <div className="text-3xl font-bold text-primary mt-1">R$ {parseFloat(selectedInstallment?.amount || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
              </div>
              <DollarSign className="h-10 w-10 text-primary/20" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-method" className="font-semibold">Forma de Recebimento</Label>
              <select
                id="payment-method"
                className={selectClass}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">💵 Dinheiro</option>
                <option value="card">💳 Cartão</option>
                <option value="transfer">🏦 Transferência / PIX</option>
              </select>
            </div>

            <Button
              onClick={() => handleMarkAsPaid(selectedInstallment?.id)}
              className="w-full h-11 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? "Processando..." : "✓ Confirmar Recebimento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
