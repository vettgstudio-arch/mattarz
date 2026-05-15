import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, PlusCircle, MinusCircle, Wallet } from "lucide-react";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function TransactionModal({
  open,
  onOpenChange,
  onSuccess,
}: TransactionModalProps) {
  const [type, setType] = useState<"capital" | "aporte" | "retirada">("aporte");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const transactions = trpc.transactions.list.useQuery();
  const createMutation = trpc.transactions.create.useMutation({
    onSuccess: () => {
      toast.success("Transação registrada com sucesso.");
      setAmount("");
      setDescription("");
      transactions.refetch();
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao registrar transação.");
    },
  });

  const deleteMutation = trpc.transactions.delete.useMutation({
    onSuccess: () => {
      toast.success("Transação removida.");
      transactions.refetch();
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao remover transação.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    createMutation.mutate({
      type,
      amount,
      description,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Gestão de Capital e Fluxo de Caixa
          </DialogTitle>
          <DialogDescription>
            Adicione capital inicial, aportes ou registre retiradas pessoais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="capital">Capital Inicial</SelectItem>
                  <SelectItem value="aporte">Aporte de Capital</SelectItem>
                  <SelectItem value="retirada">Retirada (Uso Pessoal)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Input
                id="description"
                placeholder="Ex: Investimento inicial"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Registrando..." : "Registrar Transação"}
          </Button>
        </form>

        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          <h3 className="text-sm font-semibold mb-2 px-1">Histórico de Transações</h3>
          <ScrollArea className="flex-1 border rounded-md">
            <div className="p-4 space-y-3">
              {transactions.data && transactions.data.length > 0 ? (
                transactions.data.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        t.type === 'retirada' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {t.type === 'retirada' ? <MinusCircle className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {t.type === 'capital' ? 'Capital Inicial' : t.type === 'aporte' ? 'Aporte' : 'Retirada'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.description || 'Sem descrição'} • {new Date(t.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-bold ${t.type === 'retirada' ? 'text-red-500' : 'text-green-600'}`}>
                        {t.type === 'retirada' ? '-' : '+'} R$ {parseFloat(t.amount).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => deleteMutation.mutate({ id: t.id })}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma transação registrada.</p>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
