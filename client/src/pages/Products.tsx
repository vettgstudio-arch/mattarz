import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PRODUCT_TYPES = [
  { id: "smartphone", name: "Smartphone" },
  { id: "fone", name: "Fone" },
  { id: "carregador", name: "Carregador" },
  { id: "notebook", name: "Notebook" },
  { id: "other", name: "Outros" },
];

export default function Products() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "1", // Mantido internamente para compatibilidade com o backend
    purchasePrice: "",
    salePrice: "",
    quantity: "",
    minQuantity: "0",
    description: "",
    productType: "smartphone",
    model: "",
    ram: "",
    storage: "",
    imageUrl: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const utils = trpc.useUtils();
  const products = trpc.products.list.useQuery();
  const dashboardStats = trpc.dashboard.getStats.useQuery();
  const createProduct = trpc.products.create.useMutation();
  const updateProduct = trpc.products.update.useMutation();
  const deleteProduct = trpc.products.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.purchasePrice || !formData.salePrice) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const payload = {
        ...formData,
        categoryId: 1, // Categoria fixa internamente
        quantity: parseInt(formData.quantity) || 0,
        minQuantity: 0,
      };

      if (editingId) {
        await updateProduct.mutateAsync({
          id: editingId,
          ...payload,
        });
        toast.success("Produto atualizado com sucesso");
      } else {
        await createProduct.mutateAsync(payload);
        toast.success("Produto criado com sucesso");
      }

      handleCloseDialog();
      
      // Invalida as queries para atualizar os dados em tempo real em todo o site
      await Promise.all([
        products.refetch(),
        utils.dashboard.getStats.invalidate(),
        utils.dashboard.getSalesTodayWithDetails.invalidate(),
        utils.dashboard.getProfitLast7Days.invalidate(),
        utils.dashboard.getSalesLast7Days.invalidate(),
      ]);
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      const msg = error?.message || error?.data?.message || "Erro ao salvar produto";
      toast.error(msg, { duration: 6000 });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: "1",
      purchasePrice: "",
      salePrice: "",
      quantity: "",
      minQuantity: "0",
      description: "",
      productType: "smartphone",
      model: "",
      ram: "",
      storage: "",
      imageUrl: "",
    });
    setEditingId(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      categoryId: "1",
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      quantity: product.quantity.toString(),
      minQuantity: "0",
      description: product.description || "",
      productType: product.productType || "smartphone",
      model: product.model || "",
      ram: product.ram || "",
      storage: product.storage || "",
      imageUrl: product.imageUrl || "",
    });
    setEditingId(product.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        await deleteProduct.mutateAsync({ id });
        toast.success("Produto deletado com sucesso");
        
        // Invalida as queries para atualizar os dados em tempo real em todo o site
        await Promise.all([
          products.refetch(),
          utils.dashboard.getStats.invalidate(),
          utils.dashboard.getSalesTodayWithDetails.invalidate(),
          utils.dashboard.getProfitLast7Days.invalidate(),
          utils.dashboard.getSalesLast7Days.invalidate(),
        ]);
      } catch (error) {
        toast.error("Erro ao deletar produto");
      }
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) {
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200">Sem Estoque</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200">Em Estoque</Badge>;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao fazer upload da imagem");
      setIsUploading(false);
    }
  };

  const getTypeName = (typeId: string) => {
    return PRODUCT_TYPES.find(t => t.id === typeId)?.name || "Outros";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground mt-1">Gestão de inventário e preços</p>
          </div>
          <div className="flex items-center gap-3">
            {dashboardStats.data && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                parseFloat(dashboardStats.data.cashOnHand) > 0
                  ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                  : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
              }`}>
                <AlertCircle className="h-4 w-4" />
                Caixa: R$ {parseFloat(dashboardStats.data.cashOnHand).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
            )}
          </div>
          <Dialog open={openDialog} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
            else setOpenDialog(true);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para salvar o produto.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                {/* Imagem */}
                <div className="space-y-2">
                  <Label>Imagem do Produto</Label>
                  <div className="flex items-center gap-4">
                    {formData.imageUrl && (
                      <div className="relative h-20 w-20 rounded-md overflow-hidden border border-border">
                        <img src={formData.imageUrl} className="h-full w-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                          className="absolute top-0 right-0 bg-destructive text-white p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                      {isUploading && <p className="text-xs text-muted-foreground mt-1 animate-pulse">Carregando imagem...</p>}
                    </div>
                  </div>
                </div>

                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: iPhone 15 Pro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Tipo de Produto */}
                  <div className="space-y-2">
                    <Label htmlFor="productType">Tipo de Produto *</Label>
                    <select
                      id="productType"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.productType}
                      onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
                    >
                      {PRODUCT_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Campos de Smartphone */}
                {formData.productType === "smartphone" && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-4 border border-border">
                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="Ex: iPhone 15 Pro"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ram">RAM</Label>
                        <Input
                          id="ram"
                          value={formData.ram}
                          onChange={(e) => setFormData(prev => ({ ...prev, ram: e.target.value }))}
                          placeholder="Ex: 8GB"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="storage">Armazenamento</Label>
                        <Input
                          id="storage"
                          value={formData.storage}
                          onChange={(e) => setFormData(prev => ({ ...prev, storage: e.target.value }))}
                          placeholder="Ex: 128GB"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Preço Compra *</Label>
                    <Input
                      id="purchasePrice"
                      required
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Preço Venda *</Label>
                    <Input
                      id="salePrice"
                      required
                      type="number"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade *</Label>
                    <Input
                      id="quantity"
                      required
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detalhes adicionais do produto..."
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={createProduct.isPending || updateProduct.isPending}>
                  {editingId ? "Atualizar Produto" : "Criar Produto"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-elegant border-none bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
            <CardDescription>Total de {products.data?.length || 0} produtos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Produto</th>
                    <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                    <th className="text-right py-3 px-4 font-semibold">Preço Venda</th>
                    <th className="text-left py-3 px-4 font-semibold">Qtd</th>
                    <th className="text-center py-3 px-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">Carregando produtos...</td>
                    </tr>
                  ) : products.data?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum produto encontrado</td>
                    </tr>
                  ) : (
                    products.data?.map((product: any) => (
                      <tr key={product.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} className="h-10 w-10 rounded-md object-cover border" />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                <Plus className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.productType || "Produto"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{getTypeName(product.productType)}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          R$ {parseFloat(product.salePrice).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{product.quantity} un</span>
                            {getStockStatus(product.quantity)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} title="Editar">
                              <Edit2 className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} title="Deletar">
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
