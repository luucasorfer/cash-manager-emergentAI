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
import PaymentModal from "../components/PaymentModal";
import { Plus, Pencil, Trash2, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

const FixedExpenses = () => {
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
    due_day: "",
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/fixed_expenses_months?month=${currentMonth}&year=${currentYear}`,
      );
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Erro ao carregar gastos fixos");
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
      !formData.due_day
    ) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const expenseId = `fixed-${Date.now()}`;
      await apiClient.post("/fixed_expense_templates", {
        fixed_expense_id: expenseId,
        ...formData,
        amount: parseFloat(formData.amount),
        due_day: parseInt(formData.due_day),
        month: currentMonth,
        year: currentYear,
      });
      toast.success("Gasto fixo adicionado!");
      setModalOpen(false);
      setFormData({ name: "", category_id: "", amount: "", due_day: "" });
      fetchExpenses();
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Erro ao criar gasto fixo");
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
      await apiClient.put(`/fixed_expenses_months/${editingExpense.id}`, {
        ...formData,
        amount: parseFloat(formData.amount),
        due_day: parseInt(formData.due_day),
      });
      toast.success("Gasto fixo atualizado!");
      setModalOpen(false);
      setEditingExpense(null);
      setFormData({ name: "", category_id: "", amount: "", due_day: "" });
      fetchExpenses();
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Erro ao atualizar gasto fixo");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este gasto?")) return;

    try {
      await apiClient.delete(`/fixed_expenses_months/${id}`);
      toast.success("Gasto fixo excluído!");
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Erro ao excluir gasto fixo");
    }
  };

  const handleMarkAsPaid = async (paymentMethod) => {
    try {
      await apiClient.post(
        `/fixed_expenses_months/${paymentModal.expense.id}/mark-as-paid`,
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
      due_day: expense.due_day.toString(),
    });
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingExpense(null);
    setFormData({ name: "", category_id: "", amount: "", due_day: "" });
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
    <div className="space-y-6" data-testid="fixed-expenses-page">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Gastos Fixos</h1>
        <Button
          onClick={openCreateModal}
          className="bg-emerald-500 hover:bg-emerald-600"
          data-testid="add-fixed-expense-btn"
        >
          <Plus size={20} className="mr-2" />
          Novo Gasto Fixo
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
                    Vencimento
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
                        Dia {expense.due_day}
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
        <DialogContent data-testid="expense-modal">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Editar Gasto Fixo" : "Novo Gasto Fixo"}
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
                placeholder="Ex: Aluguel"
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
                data-testid="expense-due-day-input"
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

export default FixedExpenses;
