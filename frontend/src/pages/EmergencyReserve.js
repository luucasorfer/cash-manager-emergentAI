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
import { Plus, TrendingUp, TrendingDown, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

const EmergencyReserve = () => {
  const [reserves, setReserves] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("deposit");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchReserves = async () => {
    try {
      setLoading(true);
      const [reservesRes, balanceRes] = await Promise.all([
        apiClient.get("/emergency_reserve"),
        apiClient.get("/emergency_reserve/total"),
      ]);
      setReserves(reservesRes.data);
      setBalance(balanceRes.data.total);
    } catch (error) {
      console.error("Error fetching reserves:", error);
      toast.error("Erro ao carregar reserva de emergência");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReserves();
  }, []);

  const handleCreate = async () => {
    if (!formData.amount) {
      toast.error("Informe o valor");
      return;
    }

    try {
      const amount = parseFloat(formData.amount);
      const finalAmount = transactionType === "withdrawal" ? -amount : amount;

      await apiClient.post("/emergency_reserve", {
        amount: finalAmount,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
      });

      toast.success(
        transactionType === "deposit"
          ? "Depósito realizado!"
          : "Retirada realizada!",
      );
      setModalOpen(false);
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchReserves();
    } catch (error) {
      console.error("Error creating reserve:", error);
      toast.error("Erro ao registrar movimentação");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta movimentação?"))
      return;

    try {
      await apiClient.delete(`/emergency_reserve/${id}`);
      toast.success("Movimentação excluída!");
      fetchReserves();
    } catch (error) {
      console.error("Error deleting reserve:", error);
      toast.error("Erro ao excluir movimentação");
    }
  };

  const openModal = (type) => {
    setTransactionType(type);
    setFormData({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
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
    <div className="space-y-6" data-testid="emergency-reserve-page">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Reserva de Emergência
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={() => openModal("deposit")}
            className="bg-emerald-500 hover:bg-emerald-600"
            data-testid="add-deposit-btn"
          >
            <TrendingUp size={20} className="mr-2" />
            Adicionar
          </Button>
          <Button
            onClick={() => openModal("withdrawal")}
            className="bg-rose-500 hover:bg-rose-600"
            data-testid="add-withdrawal-btn"
          >
            <TrendingDown size={20} className="mr-2" />
            Retirar
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-sm font-medium mb-2">
                Saldo da Reserva
              </p>
              <h2 className="text-5xl font-bold">{formatCurrency(balance)}</h2>
            </div>
            <div className="p-4 bg-white/20 rounded-full">
              <Shield size={48} className="text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Data
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Descrição
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">
                    Valor
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {reserves.map((reserve) => (
                  <tr
                    key={reserve.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(reserve.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {reserve.amount > 0 ? (
                          <TrendingUp size={18} className="text-emerald-600" />
                        ) : (
                          <TrendingDown size={18} className="text-rose-600" />
                        )}
                        <span className="text-slate-900">
                          {reserve.description ||
                            (reserve.amount > 0 ? "Depósito" : "Retirada")}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`text-right py-3 px-4 font-semibold ${
                        reserve.amount > 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {formatCurrency(Math.abs(reserve.amount))}
                    </td>
                    <td className="text-center py-3 px-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(reserve.id)}
                        className="text-rose-600 hover:text-rose-700"
                        data-testid={`delete-${reserve.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
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
        <DialogContent data-testid="reserve-modal">
          <DialogHeader>
            <DialogTitle>
              {transactionType === "deposit"
                ? "Adicionar à Reserva"
                : "Retirar da Reserva"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                data-testid="reserve-amount-input"
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
                data-testid="reserve-date-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Motivo da movimentação..."
                rows={3}
                data-testid="reserve-description-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              className={
                transactionType === "deposit"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-rose-500 hover:bg-rose-600"
              }
              data-testid="save-reserve-btn"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyReserve;
