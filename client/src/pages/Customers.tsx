import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, User } from "lucide-react";
import { toast } from "sonner";

export default function Customers() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  const customers = trpc.customers.list.useQuery();
  const createCustomer = trpc.customers.create.useMutation();
  const updateCustomer = trpc.customers.update.useMutation();
  const deleteCustomer = trpc.customers.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("O nome do cliente é obrigatório");
      return;
    }

    try {
      if (editingId) {
        await updateCustomer.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Cliente atualizado com sucesso");
      } else {
        await createCustomer.mutateAsync(formData);
        toast.success("Cliente criado com sucesso");
      }

      resetForm();
      setOpenDialog(false);
      customers.refetch();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast.error("Erro ao salvar cliente");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
    });
    setEditingId(null);
  };

  const handleEdit = (customer: any) => {
    setFormData({
      name: customer.name || "",
    });
    setEditingId(customer.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar este cliente?")) {
      try {
        await deleteCustomer.mutateAsync({ id });
        toast.success("Cliente deletado com sucesso");
        customers.refetch();
      } catch (error) {
        toast.error("Erro ao deletar cliente");
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground mt-1">Gerencie seus clientes</p>
          </div>
          <Dialog open={openDialog} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
            else setOpenDialog(true);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Atualize o nome do cliente" : "Informe o nome para criar um novo cliente"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="João Silva"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={createCustomer.isPending || updateCustomer.isPending}>
                  {editingId ? "Atualizar Cliente" : "Criar Cliente"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-elegant border-none bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Total de {customers.data?.length || 0} clientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Nome</th>
                    <th className="text-center py-3 px-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.isLoading ? (
                    <tr>
                      <td colSpan={2} className="text-center py-8 text-muted-foreground">Carregando clientes...</td>
                    </tr>
                  ) : customers.data?.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado</td>
                    </tr>
                  ) : (
                    customers.data?.map((customer: any) => (
                      <tr key={customer.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{customer.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)} title="Editar">
                              <Edit2 className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)} title="Deletar">
                              <Trash2 className="h-4 w-4 text-red-500" />
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
    </DashboardLayout>
  );
}
