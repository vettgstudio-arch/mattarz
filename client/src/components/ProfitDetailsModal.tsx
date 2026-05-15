import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ItemDetail {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
  purchasePricePerUnit?: string | number;
  itemCost: number;
  profit: number;
}

interface SaleDetail {
  saleId: number;
  customer?: { name: string };
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  discount: number;
  items: ItemDetail[];
  paymentMethod: string;
  createdAt?: string;
}

interface ProfitDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profitData: {
    totalSales: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    sales: SaleDetail[];
  } | null;
}

const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const payLabel = (m: string) =>
  m === 'cash' ? 'Dinheiro' : m === 'card' ? 'Cartão' : m === 'transfer' ? 'PIX' : 'Parcelado';

export default function ProfitDetailsModal({ open, onOpenChange, profitData }: ProfitDetailsModalProps) {
  if (!profitData) return null;

  const profitMargin = profitData.totalRevenue > 0
    ? ((profitData.totalProfit / profitData.totalRevenue) * 100).toFixed(1)
    : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Análise de Lucro — Todas as Vendas</DialogTitle>
          <DialogDescription>
            Detalhamento completo de receita, custo e lucro de todas as vendas
          </DialogDescription>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <p className="text-xs text-foreground/60 font-medium">Receita Total</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                R$ {fmt(profitData.totalRevenue)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <p className="text-xs text-foreground/60 font-medium">Custo Total</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                R$ {fmt(profitData.totalCost)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <p className="text-xs text-foreground/60 font-medium">Lucro Total</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                R$ {fmt(profitData.totalProfit)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <p className="text-xs text-foreground/60 font-medium">Margem</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {profitMargin}%
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-2" />

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground/70">
              Detalhes por Venda ({profitData.totalSales})
            </p>

            {profitData.sales.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma venda registrada.</p>
            )}

            {profitData.sales.map((sale) => (
              <div key={sale.saleId} className="border border-border/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">Venda #{sale.saleId}</p>
                      <Badge variant="outline" className="text-[10px]">{payLabel(sale.paymentMethod)}</Badge>
                    </div>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      {sale.customer?.name || "Cliente não identificado"}
                    </p>
                    {sale.createdAt && (
                      <p className="text-xs text-foreground/40 mt-0.5">
                        {format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-foreground/60 mb-1">Lucro</p>
                    <p className={`font-bold text-lg ${sale.totalProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      R$ {fmt(sale.totalProfit)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-muted/30 p-2 rounded">
                  <div>
                    <p className="text-foreground/60">Receita</p>
                    <p className="font-semibold">R$ {fmt(sale.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">Custo</p>
                    <p className="font-semibold">R$ {fmt(sale.totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">Margem</p>
                    <p className="font-semibold">
                      {sale.totalRevenue > 0 ? ((sale.totalProfit / sale.totalRevenue) * 100).toFixed(1) : "0"}%
                    </p>
                  </div>
                </div>

                {sale.items.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-foreground/70">Itens:</p>
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-background p-2 rounded border border-border/30">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName || `Produto #${item.productId}`}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-foreground/60">
                              {item.quantity}x | Custo unitário: R$ {fmt(parseFloat(item.purchasePricePerUnit?.toString() || "0"))}
                            </p>
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                              {parseFloat(item.subtotal as string) > 0
                                ? ((item.profit / parseFloat(item.subtotal as string)) * 100).toFixed(1)
                                : "0"}% lucro
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <p className="font-semibold">R$ {fmt(parseFloat(item.subtotal as string))}</p>
                          <p className={`text-xs font-bold ${item.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {item.profit >= 0 ? "+" : ""}R$ {fmt(item.profit)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {sale.discount > 0 && (
                  <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400 bg-orange-500/5 p-2 rounded">
                    <span>Desconto:</span>
                    <span>-R$ {fmt(sale.discount)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
