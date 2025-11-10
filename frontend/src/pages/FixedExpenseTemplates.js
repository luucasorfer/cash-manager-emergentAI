import { useState, useEffect } from "react";
import { apiClient } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Power, PowerOff, Zap } from "lucide-react";
import { toast } from "sonner";

const FixedExpenseTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    amount: "",
    due_day: "",
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/fixed-expense-templates");
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
  }, []);

  const handleCreate = async () => {
    if (
      !formData.name ||
      !formData.category_id ||
      !formData.amount ||
      !formData.due_day
    ) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await apiClient.post("/fixed-expense-templates", {
        ...formData,
        amount: parseFloat(formData.amount?.replace(",", ".") || 0),
        due_day: parseInt(formData.due_day),
      });
      toast.success("Template criado com sucesso!");
      setModalOpen(false);
      setFormData({ name: "", category_id: "", amount: "", due_day: "" });
      fetchTemplates();
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Erro ao criar template");
    }
  };

  const handleUpdate = async () => {
    if (
      !formData.name ||
      !formData.category_id ||
      !formData.amount ||
      !formData.due_day
    ) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await apiClient.put(`/fixed-expense-templates/${editingTemplate.id}`, {
        ...formData,
        amount: parseFloat(formData.amount?.replace(",", ".") || 0),
        due_day: parseInt(formData.due_day),
      });
      toast.success("Template atualizado!");
      setModalOpen(false);
      setEditingTemplate(null);
      setFormData({ name: "", category_id: "", amount: "", due_day: "" });
      fetchTemplates();
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Erro ao atualizar template");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este template?"))
      return;

    try {
      await apiClient.delete(`/fixed-expense-templates/${id}`);
      toast.success("Template excluído!");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Erro ao excluir template");
    }
  };

  const handleToggleActive = async (template) => {
    try {
      await apiClient.put(`/fixed-expense-templates/${template.id}`, {
        is_active: !template.is_active,
      });
      toast.success(
        template.is_active ? "Template desativado!" : "Template ativado!",
      );
      fetchTemplates();
    } catch (error) {
      console.error("Error toggling template:", error);
      toast.error("Erro ao alterar status do template");
    }
  };

  const handleGenerateForMonth = async (templateId, templateName) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    try {
      await apiClient.post(
        `/fixed-expense-templates/${templateId}/generate-month?month=${currentMonth}&year=${currentYear}`,
      );
      toast.success(`Despesa "${templateName}" gerada para o mês atual!`);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.warning("Esta despesa já existe para o mês atual");
      } else {
        console.error("Error generating month:", error);
        toast.error("Erro ao gerar despesa mensal");
      }
    }
  };

  const handleGenerateAllForMonth = async () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    try {
      const response = await apiClient.post(
        `/fixed-expense-templates/generate-all-for-month?month=${currentMonth}&year=${currentYear}`,
      );
      const { created, skipped } = response.data;
      if (created > 0) {
        toast.success(
          `${created} despesa(s) gerada(s)! ${
            skipped > 0 ? `${skipped} já existia(m).` : ""
          }`,
        );
      } else {
        toast.info("Todas as despesas já foram geradas para este mês");
      }
    } catch (error) {
      console.error("Error generating all months:", error);
      toast.error("Erro ao gerar despesas mensais");
    }
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category_id: template.category_id,
      amount: template.amount.toString(),
      due_day: template.due_day.toString(),
    });
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({ name: "", category_id: "", amount: "", due_day: "" });
    setModalOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="fixed-expense-templates-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Templates de Gastos Fixos
          </h1>
          <p className="text-slate-600 mt-1">
            Gerencie modelos de despesas recorrentes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateAllForMonth}
            className="bg-blue-500 hover:bg-blue-600"
            data-testid="generate-all-btn"
          >
            <Zap size={20} className="mr-2" />
            Gerar Mês Atual
          </Button>
          <Button
            onClick={openCreateModal}
            className="bg-emerald-500 hover:bg-emerald-600"
            data-testid="add-template-btn"
          >
            <Plus size={20} className="mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Templates Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>Nenhum template cadastrado ainda.</p>
              <p className="text-sm mt-2">
                Crie templates para gerar despesas fixas automaticamente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Descrição
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Categoria
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Valor Base
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Vencimento
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => {
                    const category = categories.find(
                      (c) => c.id === template.category_id,
                    );
                    return (
                      <tr
                        key={template.id}
                        className={`border-b border-slate-100 hover:bg-slate-50 ${
                          !template.is_active ? "opacity-50" : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleActive(template)}
                            className={`p-1 rounded-full ${
                              template.is_active
                                ? "text-emerald-600 hover:bg-emerald-100"
                                : "text-slate-400 hover:bg-slate-200"
                            }`}
                            title={template.is_active ? "Desativar" : "Ativar"}
                          >
                            {template.is_active ? (
                              <Power size={20} />
                            ) : (
                              <PowerOff size={20} />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {template.name}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{category?.icon}</span>
                            <span className="text-sm text-slate-600">
                              {category?.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-slate-900">
                          {formatCurrency(Number(template.amount) || 0)}
                        </td>
                        <td className="text-center py-3 px-4 text-sm text-slate-600">
                          Dia {template.due_day}
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleGenerateForMonth(
                                  template.id,
                                  template.name,
                                )
                              }
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Gerar para mês atual"
                            >
                              <Zap size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(template)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Pencil size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criar/Editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Despesa</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Aluguel"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Valor Base</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="due_day">Dia do Vencimento</Label>
              <Input
                id="due_day"
                type="number"
                min="1"
                max="31"
                value={formData.due_day}
                onChange={(e) =>
                  setFormData({ ...formData, due_day: e.target.value })
                }
                placeholder="1-31"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingTemplate ? handleUpdate : handleCreate}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {editingTemplate ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FixedExpenseTemplates;
