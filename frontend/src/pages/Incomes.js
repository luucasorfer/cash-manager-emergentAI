import { useState, useEffect } from 'react';
import { apiClient } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const Incomes = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    notes: ''
  });

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/incomes?month=${currentMonth}&year=${currentYear}`);
      setIncomes(response.data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      toast.error('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [currentMonth, currentYear]);

  const handleCreate = async () => {
    if (!formData.name || !formData.amount || !formData.date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await apiClient.post('/incomes', {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      });
      toast.success('Receita adicionada!');
      setModalOpen(false);
      setFormData({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        notes: ''
      });
      fetchIncomes();
    } catch (error) {
      console.error('Error creating income:', error);
      toast.error('Erro ao criar receita');
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.amount || !formData.date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await apiClient.put(`/incomes/${editingIncome.id}`, {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      });
      toast.success('Receita atualizada!');
      setModalOpen(false);
      setEditingIncome(null);
      setFormData({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        notes: ''
      });
      fetchIncomes();
    } catch (error) {
      console.error('Error updating income:', error);
      toast.error('Erro ao atualizar receita');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta receita?')) return;

    try {
      await apiClient.delete(`/incomes/${id}`);
      toast.success('Receita excluída!');
      fetchIncomes();
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('Erro ao excluir receita');
    }
  };

  const openEditModal = (income) => {
    setEditingIncome(income);
    setFormData({
      name: income.name,
      amount: income.amount.toString(),
      date: new Date(income.date).toISOString().split('T')[0],
      is_recurring: income.is_recurring,
      notes: income.notes || ''
    });
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingIncome(null);
    setFormData({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      notes: ''
    });
    setModalOpen(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="space-y-6" data-testid="incomes-page">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Receitas</h1>
        <Button
          onClick={openCreateModal}
          className="bg-emerald-500 hover:bg-emerald-600"
          data-testid="add-income-btn"
        >
          <Plus size={20} className="mr-2" />
          Nova Receita
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
            <option key={index} value={index + 1}>{name}</option>
          ))}
        </select>
        <select
          value={currentYear}
          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          data-testid="year-selector"
        >
          {[2023, 2024, 2025, 2026].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Total Card */}
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-emerald-100 text-sm font-medium mb-2">Total de Receitas</p>
            <h2 className="text-4xl font-bold">{formatCurrency(totalIncome)}</h2>
          </div>
        </CardContent>
      </Card>

      {/* Incomes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Descrição</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Valor</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Data</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Tipo</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{income.name}</div>
                      {income.notes && (
                        <div className="text-xs text-slate-500 mt-1">{income.notes}</div>
                      )}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-emerald-600">
                      {formatCurrency(income.amount)}
                    </td>
                    <td className="text-center py-3 px-4 text-sm text-slate-600">
                      {new Date(income.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`
                        inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                        ${income.is_recurring 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-slate-100 text-slate-700'
                        }
                      `}>
                        {income.is_recurring ? 'Recorrente' : 'Único'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(income)}
                          data-testid={`edit-${income.id}`}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(income.id)}
                          className="text-rose-600 hover:text-rose-700"
                          data-testid={`delete-${income.id}`}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg" data-testid="income-modal">
          <DialogHeader>
            <DialogTitle>{editingIncome ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Descrição</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Salário"
                data-testid="income-name-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  data-testid="income-amount-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  data-testid="income-date-input"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                data-testid="income-recurring-checkbox"
              />
              <Label htmlFor="is_recurring" className="cursor-pointer">
                Receita recorrente (mensal)
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Anotações adicionais..."
                rows={3}
                data-testid="income-notes-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingIncome ? handleUpdate : handleCreate}
              className="bg-emerald-500 hover:bg-emerald-600"
              data-testid="save-income-btn"
            >
              {editingIncome ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Incomes;
