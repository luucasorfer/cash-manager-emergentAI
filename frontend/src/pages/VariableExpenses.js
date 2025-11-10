import { useState, useEffect } from "react";
import { apiClient } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import PaymentModal from "../components/PaymentModal";
import { Plus, Pencil, Trash2, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

const VariableExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    expense: null,
  });
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    installments: "1",
    notes: "",
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/variable_expenses?month=${currentMonth}&year=${currentYear}`,
      );
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Erro ao carregar gastos variáveis");
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
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [currentMonth, currentYear]);

  const handleCreate = async () => {
    if (
      !formData.name ||
      !formData.category_id ||
      !formData.amount ||
      !formData.date
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await apiClient.post("/variable_expenses", {
        ...formData,
        amount: parseFloat(formData.amount),
        installments: parseInt(formData.installments),
        date: new Date(formData.date).toISOString(),
      });
      toast.success("Gasto variável adicionado!");
      setModalOpen(false);
      setFormData({
        name: "",
        category_id: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        installments: "1",
        notes: "",
      });
      fetchExpenses();
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Erro ao criar gasto variável");
    }
  };

  const handleUpdate = async () => {
    if (
      !formData.name ||
      !formData.category_id ||
      !formData.amount ||
      !formData.date
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await apiClient.put(`/variable_expenses/${editingExpense.id}`, {
        ...formData,
        amount: parseFloat(formData.amount),
        installments: parseInt(formData.installments),
        date: new Date(formData.date).toISOString(),
      });
      toast.success("Gasto variável atualizado!");
      setModalOpen(false);
      setEditingExpense(null);
      setFormData({
        name: "",
        category_id: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        installments: "1",
        notes: "",
      });
      fetchExpenses();
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Erro ao atualizar gasto variável");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este gasto?")) return;

    try {
      await apiClient.delete(`/variable_expenses/${id}`);
      toast.success("Gasto variável excluído!");
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Erro ao excluir gasto variável");
    }
  };

  const handleMarkAsPaid = async (paymentMethod) => {
    try {
      await apiClient.post(
        `/variable_expenses/${paymentModal.expense.id}/mark-as-paid`,
        {
          payment_method: paymentMethod,
        },
      );
      toast.success("Despesa marcada como paga!");
      fetchExpenses();
    } catch (error) {
      console.error("Error marking as paid:", error);
      toast.error("Erro ao marcar como paga");
    }
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      category_id: expense.category_id,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split("T")[0],
      installments: expense.installments.toString(),
      notes: expense.notes || "",
    });
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingExpense(null);
    setFormData({
      name: "",
      category_id: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      installments: "1",
      notes: "",
    });
    setModalOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="variable-expenses-page">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Gastos Variáveis</h1>
        <Button
          onClick={openCreateModal}
          className="bg-emerald-500 hover:bg-emerald-600"
          data-testid="add-variable-expense-btn"
        >
          <Plus size={20} className="mr-2" />
          Novo Gasto Variável
        </Button>
      </div>

      {/* Month/Year Selector */}
      <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md">
        <Calendar className="text-emerald-600" size={24} />
        <select
          value={currentMonth}
          onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          data-testid="month-selector"
        >
          {monthNames.map((name, index) => (
            <option key={index} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={currentYear}
          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          data-testid="year-selector"
        >
          {[2023, 2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gastos do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Descrição
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Categoria
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">
                    Valor
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">
                    Data
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">
                    Parcelas
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  const category = categories.find(
                    (c) => c.id === expense.category_id,
                  );
                  return (
                    <tr
                      key={expense.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {expense.name}
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
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-slate-600">
                        {new Date(expense.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-slate-600">
                        {expense.current_installment}/{expense.installments}x
                      </td>
                      <td className="text-center py-3 px-4">
                        <span
                          className={`
                          inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                          ${
                            expense.status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        `}
                        >
                          {expense.status === "paid" ? "✓ Pago" : "Pendente"}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {expense.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                setPaymentModal({ open: true, expense })
                              }
                              className="bg-emerald-500 hover:bg-emerald-600"
                              data-testid={`mark-paid-${expense.id}`}
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Pagar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(expense)}
                            data-testid={`edit-${expense.id}`}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(expense.id)}
                            className="text-rose-600 hover:text-rose-700"
                            data-testid={`delete-${expense.id}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg" data-testid="expense-modal">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Editar Gasto Variável" : "Novo Gasto Variável"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Descrição</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Compra no supermercado"
                data-testid="expense-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger data-testid="category-select">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  data-testid="expense-amount-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  data-testid="expense-date-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="installments">Número de Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                value={formData.installments}
                onChange={(e) =>
                  setFormData({ ...formData, installments: e.target.value })
                }
                data-testid="expense-installments-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Anotações adicionais..."
                rows={3}
                data-testid="expense-notes-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingExpense ? handleUpdate : handleCreate}
              className="bg-emerald-500 hover:bg-emerald-600"
              data-testid="save-expense-btn"
            >
              {editingExpense ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, expense: null })}
        onConfirm={handleMarkAsPaid}
        expenseName={paymentModal.expense?.name}
      />
    </div>
  );
};

export default VariableExpenses;
