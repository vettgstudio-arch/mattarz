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

interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
}

interface Sale {
  id: number;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
  };
  items: SaleItem[];
  finalAmount: string | number;
  discount: string | number;
  paymentMethod: string;
  createdAt: string | Date;
}

interface SalesTodayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sales: Sale[];
  totalRevenue: number;
}

export default function SalesTodayModal({
  open,
  onOpenChange,
  sales,
  totalRevenue,
}: SalesTodayModalProps) {
  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "Dinheiro",
      card: "Cartão",
      transfer: "Transferência",
      installments: "Parcelado",
    };
    return labels[method] || method;
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: "bg-green-500/20 text-green-700 dark:text-green-300",
      card: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      transfer: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
      installments: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
    };
    return colors[method] || "bg-gray-500/20 text-gray-700";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Vendas do Dia</DialogTitle>
          <DialogDescription>
            Total de {sales.length} venda{sales.length !== 1 ? "s" : ""} - R$ {totalRevenue.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {sales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-foreground/60 font-medium">Nenhuma venda registrada hoje</p>
              </div>
            ) : (
              sales.map((sale, index) => (
                <div key={sale.id} className="border border-border/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Venda #{sale.id}</p>
                      <p className="text-xs text-foreground/60 mt-1">
                        {sale.customer?.name || "Cliente não identificado"}
                      </p>
                      {sale.customer?.phone && (
                        <p className="text-xs text-foreground/50">
                          {sale.customer.phone}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600 dark:text-green-400">
                        R$ {parseFloat(sale.finalAmount as any).toFixed(2)}
                      </p>
                      <Badge className={`mt-2 ${getPaymentMethodColor(sale.paymentMethod)}`}>
                        {getPaymentMethodLabel(sale.paymentMethod)}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground/70">Itens:</p>
                    {sale.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-foreground/60">
                            {item.quantity}x R$ {parseFloat(item.unitPrice as any).toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold text-right">
                          R$ {parseFloat(item.subtotal as any).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {parseFloat(sale.discount as any) > 0 && (
                    <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400 bg-orange-500/5 p-2 rounded">
                      <span>Desconto:</span>
                      <span>-R$ {parseFloat(sale.discount as any).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="text-xs text-foreground/50 pt-2">
                    {new Date(sale.createdAt).toLocaleTimeString("pt-BR")}
                  </div>

                  {index < sales.length - 1 && <Separator className="my-4" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
