import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, Search, Calendar, CreditCard, Receipt, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export default function Sales() {
  const [openDialog, setOpenDialog] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [installments, setInstallments] = useState(1);
  const [discount, setDiscount] = useState("0");
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [installmentDates, setInstallmentDates] = useState<string[]>([]);
  const [installmentAmounts, setInstallmentAmounts] = useState<string[]>([]);

  const customers = trpc.customers.list.useQuery();
  const products = trpc.products.list.useQuery();
  const utils = trpc.useUtils();
  const sales = trpc.sales.list.useQuery();
  const createSale = trpc.sales.create.useMutation();
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editSaleDialog, setEditSaleDialog] = useState(false);
  const [editSaleData, setEditSaleData] = useState<any>(null);
  const deleteSale = trpc.sales.delete.useMutation();
  const updateSale = trpc.sales.update.useMutation();

  const handleAddItem = () => {
    if (!selectedProduct || !quantity) {
      toast.error("Selecione um produto e quantidade");
      return;
    }

    const product = products.data?.find((p: any) => p.id === parseInt(selectedProduct));
    if (!product) return;

    if (product.quantity < parseInt(quantity)) {
      toast.error(`Estoque insuficiente. Disponível: ${product.quantity}`);
      return;
    }

    const item = {
      productId: parseInt(selectedProduct),
      productName: product.name,
      quantity: parseInt(quantity),
      unitPrice: product.salePrice,
      subtotal: (parseFloat(product.salePrice) * parseInt(quantity)).toFixed(2),
    };

    setSaleItems([...saleItems, item]);
    setSelectedProduct("");
    setQuantity("1");
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const subtotal = saleItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const disc = parseFloat(discount) || 0;
    return Math.max(0, subtotal - disc).toFixed(2);
  };

  const handleInstallmentsChange = (value: number) => {
    setInstallments(value);
    setInstallmentDates(Array(value).fill(""));
    // Init amounts equally split
    const equalAmount = saleItems.length > 0
      ? (parseFloat(calculateTotal()) / value).toFixed(2)
      : "0.00";
    setInstallmentAmounts(Array(value).fill(equalAmount));
  };

  const handleInstallmentAmountChange = (index: number, value: string) => {
    const newAmounts = [...installmentAmounts];
    newAmounts[index] = value;
    setInstallmentAmounts(newAmounts);
  };

  const getTotalInstallmentsAmount = () => {
    return installmentAmounts.reduce((sum, a) => sum + (parseFloat(a) || 0), 0);
  };

  const handleInstallmentDateChange = (index: number, date: string) => {
    const newDates = [...installmentDates];
    newDates[index] = date;
    setInstallmentDates(newDates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || saleItems.length === 0) {
      toast.error("Selecione um cliente e adicione produtos");
      return;
    }

    // Validate installment dates if payment method is installments
    if (paymentMethod === "installments" && installments > 1) {
      const missingDates = installmentDates.some(date => !date);
      if (missingDates) {
        toast.error("Preencha as datas de vencimento de todas as parcelas");
        return;
      }
    }

    try {
      const totalAmount = saleItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);
      const finalAmount = calculateTotal();

      await createSale.mutateAsync({
        customerId: parseInt(customerId),
        totalAmount,
        discount: discount || "0",
        finalAmount,
        paymentMethod: paymentMethod as "cash" | "card" | "transfer" | "installments",
        installments: paymentMethod === "installments" ? installments : 1,
        status: "completed",
        items: saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
        installmentDates: paymentMethod === "installments" ? installmentDates : undefined,
        installmentAmounts: paymentMethod === "installments" ? installmentAmounts : undefined,
      });

      toast.success("Venda registrada com sucesso");
      setCustomerId("");
      setPaymentMethod("cash");
      setInstallments(1);
      setDiscount("0");
      setSaleItems([]);
      setInstallmentDates([]);
      setInstallmentAmounts([]);
      setOpenDialog(false);
      
      // Invalida as queries para atualizar os dados em tempo real em todo o site
      await Promise.all([
        sales.refetch(),
        utils.dashboard.getStats.invalidate(),
        utils.dashboard.getSalesTodayWithDetails.invalidate(),
        utils.dashboard.getProfitLast7Days.invalidate(),
        utils.dashboard.getSalesLast7Days.invalidate(),
        utils.products.list.invalidate(), // Atualiza o estoque
      ]);
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      toast.error("Erro ao registrar venda");
    }
  };

  const handleDeleteSale = async (id: number) => {
    try {
      await deleteSale.mutateAsync({ id });
      toast.success("Venda excluída com sucesso");
      await Promise.all([
        sales.refetch(),
        utils.dashboard.getStats.invalidate(),
        utils.dashboard.getSalesTodayWithDetails.invalidate(),
        utils.dashboard.getProfitLast7Days.invalidate(),
        utils.dashboard.getSalesLast7Days.invalidate(),
        utils.products.list.invalidate(),
      ]);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir venda");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleUpdateSale = async () => {
    if (!editSaleData) return;
    try {
      await updateSale.mutateAsync({
        id: editSaleData.id,
        notes: editSaleData.notes,
      });
      toast.success("Venda atualizada");
      setEditSaleDialog(false);
      sales.refetch();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar venda");
    }
  };

  const getCustomerName = (id: number) => {
    return customers.data?.find((c: any) => c.id === id)?.name || "Cliente Excluído";
  };

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vendas</h1>
            <p className="text-muted-foreground mt-1">Registre e acompanhe suas vendas</p>
          </div>
          <Dialog open={openDialog} onOpenChange={(open) => {
            setOpenDialog(open);
            if (!open) {
              setCustomerId("");
              setSaleItems([]);
              setDiscount("0");
              setInstallmentDates([]);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nova Venda</DialogTitle>
                <DialogDescription>
                  Preencha os dados da venda e adicione os produtos
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="customer">Cliente *</Label>
                  <select
                    id="customer"
                    className={selectClass}
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                  >
                    <option value="">Selecione um cliente...</option>
	                    {customers.data?.map((customer: any) => (
	                      <option key={customer.id} value={customer.id.toString()}>
	                        {customer.name}
	                      </option>
	                    ))}
                  </select>
                </div>

                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Adicionar Produtos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <Label htmlFor="product">Produto</Label>
                      <select
                        id="product"
                        className={selectClass}
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {products.data?.filter((product: any) => product.quantity > 0).map((product: any) => (
                          <option key={product.id} value={product.id.toString()}>
                            {product.name} (Estoque: {product.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="qty">Quantidade</Label>
                      <Input
                        id="qty"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" onClick={handleAddItem} className="w-full" variant="secondary">
                        Adicionar Item
                      </Button>
                    </div>
                  </div>
                </div>

                {saleItems.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Itens da Venda</h3>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left py-2 px-4">Produto</th>
                            <th className="text-center py-2 px-4">Qtd</th>
                            <th className="text-right py-2 px-4">Preço</th>
                            <th className="text-right py-2 px-4">Subtotal</th>
                            <th className="text-center py-2 px-4">Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {saleItems.map((item, index) => (
                            <tr key={index} className="border-t border-border">
                              <td className="py-2 px-4 font-medium">{item.productName}</td>
                              <td className="text-center py-2 px-4">{item.quantity}</td>
                              <td className="text-right py-2 px-4">R$ {parseFloat(item.unitPrice).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                              <td className="text-right py-2 px-4 font-semibold">R$ {parseFloat(item.subtotal).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                              <td className="text-center py-2 px-4">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">Desconto (R$)</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment">Forma de Pagamento</Label>
                    <select
                      id="payment"
                      className={selectClass}
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        if (e.target.value !== "installments") {
                          setInstallmentDates([]);
                        }
                      }}
                    >
                      <option value="cash">Dinheiro</option>
                      <option value="card">Cartão</option>
                      <option value="transfer">Transferência / PIX</option>
                      <option value="installments">Parcelado (Contas a Receber)</option>
                    </select>
                  </div>
                </div>

                {paymentMethod === "installments" && (
                  <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      <Label htmlFor="installments">Número de Parcelas</Label>
                    </div>
                    <Input
                      id="installments"
                      type="number"
                      min="1"
                      max="12"
                      value={installments}
                      onChange={(e) => handleInstallmentsChange(parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Defina a data de vencimento para cada parcela abaixo.
                    </p>

                    {/* Installment Dates */}
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Parcelas e Vencimentos
                        </h4>
                        {installmentAmounts.length > 0 && (() => {
                          const total = getTotalInstallmentsAmount();
                          const expected = parseFloat(calculateTotal());
                          const diff = Math.abs(total - expected);
                          if (diff > 0.01) {
                            return (
                              <span className="text-xs text-red-500 font-semibold">
                                ⚠ Soma das parcelas: R$ {total.toLocaleString('pt-BR', {minimumFractionDigits: 2})} (faltam R$ {(expected - total).toLocaleString('pt-BR', {minimumFractionDigits: 2})})
                              </span>
                            );
                          }
                          return <span className="text-xs text-green-500 font-semibold">✓ Valores corretos</span>;
                        })()}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.from({ length: installments }).map((_, index) => {
                          const installmentAmount = (parseFloat(calculateTotal()) / installments).toFixed(2);
                          return (
                            <div key={index} className="space-y-2 p-3 bg-background rounded-md border border-border">
                              <div className="flex justify-between items-center gap-2">
                                <Label htmlFor={`date-${index}`} className="text-sm shrink-0">
                                  Parcela {index + 1}/{installments}
                                </Label>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">R$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-24 text-xs font-semibold text-primary border border-primary/30 rounded px-1.5 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={installmentAmounts[index] || installmentAmount}
                                    onChange={(e) => handleInstallmentAmountChange(index, e.target.value)}
                                  />
                                </div>
                              </div>
                              <Input
                                id={`date-${index}`}
                                type="date"
                                value={installmentDates[index] || ""}
                                onChange={(e) => handleInstallmentDateChange(index, e.target.value)}
                                required
                                className="text-sm"
                              />
                              {installmentDates[index] && (() => {
                                const [y, m, d] = installmentDates[index].split('-').map(Number);
                                const localDate = new Date(y, m - 1, d);
                                return (
                                  <p className="text-xs text-muted-foreground">
                                    {format(localDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                  </p>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary">Total da Venda:</span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {parseFloat(calculateTotal()).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg" disabled={createSale.isPending}>
                  {createSale.isPending ? "Processando..." : "Finalizar Venda"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-elegant border-none bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Histórico de Vendas
              </CardTitle>
              <CardDescription>Visualize e gerencie todas as vendas realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Data</th>
                      <th className="text-left py-3 px-4">Cliente</th>
                      <th className="text-left py-3 px-4">Itens</th>
                      <th className="text-center py-3 px-4">Pagamento</th>
                      <th className="text-right py-3 px-4">Total</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-center py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.isLoading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">Carregando vendas...</td>
                      </tr>
                    ) : sales.data?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma venda encontrada</td>
                      </tr>
                    ) : (
                      sales.data?.map((sale: any) => (
                        <tr key={sale.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs">#{sale.id}</td>
                          <td className="py-3 px-4">
                            {format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {getCustomerName(sale.customerId)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className="text-muted-foreground">-</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="capitalize inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium">
                              <CreditCard className="h-3 w-3" />
                              {sale.paymentMethod === 'cash' ? 'Dinheiro' : 
                               sale.paymentMethod === 'card' ? 'Cartão' : 
                               sale.paymentMethod === 'transfer' ? 'PIX' : 'Parcelado'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            R$ {parseFloat(sale.finalAmount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              sale.paymentMethod === 'installments' 
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {sale.paymentMethod === 'installments' ? 'Pendente' : 'Recebido'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                                title="Editar observações"
                                onClick={() => { setEditSaleData({ id: sale.id, notes: sale.notes || "" }); setEditSaleDialog(true); }}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                title="Excluir venda"
                                onClick={() => setConfirmDeleteId(sale.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confirm Delete Dialog */}
        <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Venda #{confirmDeleteId}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O estoque dos produtos será restaurado automaticamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => confirmDeleteId && handleDeleteSale(confirmDeleteId)}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Sale Dialog */}
        <Dialog open={editSaleDialog} onOpenChange={setEditSaleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Venda #{editSaleData?.id}</DialogTitle>
              <DialogDescription>Adicione observações ou notas sobre esta venda</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium">Observações</label>
                <textarea
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                  value={editSaleData?.notes || ""}
                  onChange={(e) => setEditSaleData((prev: any) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ex: Cliente pediu desconto, pagou adiantado, cancelou parcela..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditSaleDialog(false)}>Cancelar</Button>
              <Button onClick={handleUpdateSale} disabled={updateSale.isPending}>
                {updateSale.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
