import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function NotificationsCard() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [, setLocation] = useLocation();
  const upcomingInstallments = trpc.dashboard.getUpcomingAndOverdueInstallments.useQuery();
  const customers = trpc.customers.list.useQuery();

  useEffect(() => {
    if (upcomingInstallments.data) {
      const processed = upcomingInstallments.data.map((inst: any) => {
        const dueDate = new Date(inst.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let type = diffDays < 0 ? "overdue" : diffDays === 0 ? "today" : "upcoming";
        return { ...inst, diffDays, type };
      });
      setNotifications(processed);
    }
  }, [upcomingInstallments.data]);

  const getCustomerName = (customerId: number) => {
    const c = customers.data?.find((c: any) => c.id === customerId);
    return c?.name || "Cliente";
  };

  const overdueCount = notifications.filter(n => n.type === "overdue").length;
  const todayCount = notifications.filter(n => n.type === "today").length;
  const upcomingCount = notifications.filter(n => n.type === "upcoming").length;

  const getColor = (type: string) => {
    switch (type) {
      case "overdue": return "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-500/20";
      case "today": return "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-500/20";
      case "upcoming": return "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20";
      default: return "bg-gray-500/10 border-gray-500/30";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "overdue": return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
      case "today": return <Clock className="h-4 w-4 text-orange-500 shrink-0" />;
      default: return <Clock className="h-4 w-4 text-blue-500 shrink-0" />;
    }
  };

  const getLabel = (type: string, days: number) => {
    switch (type) {
      case "overdue": return `Vencido há ${Math.abs(days)} dia${Math.abs(days) !== 1 ? "s" : ""}`;
      case "today": return "Vence hoje!";
      default: return `Vence em ${days} dia${days !== 1 ? "s" : ""}`;
    }
  };

  return (
    <Card className="border-border/50 col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Notificações de Vencimento
            </CardTitle>
            <CardDescription>Parcelas a vencer ou vencidas</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <Badge className="bg-red-500/20 text-red-600 dark:text-red-400">{overdueCount} Vencidas</Badge>
            )}
            {todayCount > 0 && (
              <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-400">{todayCount} Hoje</Badge>
            )}
            {upcomingCount > 0 && (
              <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400">{upcomingCount} Próximas</Badge>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => setLocation("/receivables")}
                className="text-xs text-primary underline-offset-2 hover:underline flex items-center gap-1 ml-2"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3 opacity-50" />
            <p className="text-foreground/60 font-medium">Nenhuma notificação</p>
            <p className="text-sm text-foreground/40">Todas as parcelas estão em dia!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {notifications.map((n) => (
              <button
                key={n.id}
                className={`w-full text-left p-3 rounded-lg border transition-all ${getColor(n.type)} flex items-start gap-3 cursor-pointer`}
                onClick={() => setLocation("/receivables")}
              >
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm">
                      Parcela {n.installmentNumber}/{n.totalInstallments} — {getCustomerName(n.customerId)}
                    </p>
                    <p className="text-xs font-bold whitespace-nowrap">
                      R$ {parseFloat(n.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <p className="text-xs opacity-75 mt-0.5">{getLabel(n.type, n.diffDays)}</p>
                  <p className="text-xs opacity-60">
                    Vencimento: {new Date(n.dueDate).toLocaleDateString("pt-BR")} · Venda #{n.saleId}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 mt-1 opacity-40 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
