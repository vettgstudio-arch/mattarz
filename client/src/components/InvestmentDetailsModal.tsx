import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface InvestmentItem {
  productId: number;
  productName: string;
  quantity: number;
  unitCost: string | number;
  totalCost: number;
}

interface InvestmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investmentData: {
    totalInvestment: number;
    totalReplenishmentCost?: number;
    totalCOGS?: number;
    items: InvestmentItem[];
  } | null;
}

const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export default function InvestmentDetailsModal({ open, onOpenChange, investmentData }: InvestmentDetailsModalProps) {
  if (!investmentData) return null;

  const totalReplenishmentCost = investmentData.totalReplenishmentCost ?? 0;
  const totalCOGS = investmentData.totalCOGS ?? 0;
  const currentStockValue = investmentData.totalInvestment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            Detalhamento de Investimento
          </DialogTitle>
          <DialogDescription>
            Visão completa do capital investido, vendido e em estoque
          </DialogDescription>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-foreground/60 font-medium">Total Comprado (Capital Gasto)</p>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                R$ {fmt(totalReplenishmentCost)}
              </p>
              <p className="text-xs text-foreground/50 mt-1">Todas as compras de estoque</p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-amber-500" />
                <p className="text-xs text-foreground/60 font-medium">Custo do Que Foi Vendido</p>
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                R$ {fmt(totalCOGS)}
              </p>
              <p className="text-xs text-foreground/50 mt-1">Custo dos produtos vendidos (CMV)</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-xs text-foreground/60 font-medium">Estoque Atual (Valor)</p>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                R$ {fmt(currentStockValue)}
              </p>
              <p className="text-xs text-foreground/50 mt-1">{investmentData.items.length} produto(s) em estoque</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-2" />

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground/70 mb-2">
              Produtos em Estoque ({investmentData.items.length})
            </p>

            {investmentData.items.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum produto em estoque no momento.</p>
                <p className="text-xs mt-1">Adicione produtos ou faça reposição de estoque.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {investmentData.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.productName}</p>
                        <p className="text-xs text-foreground/60">
                          {item.quantity} un. × R$ {fmt(parseFloat(item.unitCost.toString()))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground/60">Valor em estoque</p>
                      <p className="font-bold text-blue-500">
                        R$ {fmt(item.totalCost)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
