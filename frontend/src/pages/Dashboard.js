import { useState, useEffect } from "react";
import { apiClient } from "../App";
import StatCard from "../components/StatCard";
import PaymentModal from "../components/PaymentModal";
import {
  DollarSign,
  TrendingDown,
  Wallet,
  Shield,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    expense: null,
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/dashboard?month=${currentMonth}&year=${currentYear}`,
      );
      setDashboard(response.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error("Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentMonth, currentYear]);

  const handleMarkAsPaid = async (paymentMethod) => {
    try {
      const endpoint =
        paymentModal.expense.type === "fixed"
          ? `/fixed-expenses/${paymentModal.expense.id}/mark-paid`
          : `/variable-expenses/${paymentModal.expense.id}/mark-paid`;

      await apiClient.post(endpoint, { payment_method: paymentMethod });
      toast.success("Despesa marcada como paga!");
      fetchDashboard();
    } catch (error) {
      console.error("Error marking as paid:", error);
      toast.error("Erro ao marcar despesa como paga");
    }
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
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Month/Year Selector */}
      <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md">
        <Calendar className="text-emerald-600" size={24} />
        <select
          value={currentMonth}
          onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          data-testid="year-selector"
        >
          {[2023, 2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Alerts */}
      {dashboard?.alerts?.length > 0 && (
        <div className="space-y-2">
          {dashboard.alerts.map((alert, index) => (
            <Alert
              key={index}
              className="border-amber-200 bg-amber-50"
              data-testid="alert-item"
            >
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Receitas"
          value={formatCurrency(dashboard?.total_income || 0)}
          color="emerald"
        />
        <StatCard
          icon={TrendingDown}
          title="Despesas"
          value={formatCurrency(dashboard?.total_expenses || 0)}
          color="rose"
        />
        <StatCard
          icon={Wallet}
          title="Saldo"
          value={formatCurrency(dashboard?.balance || 0)}
          color={dashboard?.balance >= 0 ? "blue" : "rose"}
        />
        <StatCard
          icon={Shield}
          title="Com Reserva"
          value={formatCurrency(dashboard?.balance_with_reserve || 0)}
          subtitle={`Reserva: ${formatCurrency(
            dashboard?.emergency_reserve || 0,
          )}`}
          color="violet"
        />
      </div>

      {/* Pending Expenses Table */}
      {dashboard?.pending_expenses?.length > 0 && (
        <Card data-testid="pending-expenses-table">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-amber-500" size={20} />
              Despesas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Descrição
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Valor
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
                  {dashboard.pending_expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {expense.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {expense.type === "fixed"
                            ? "Gasto Fixo"
                            : "Gasto Variável"}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-rose-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-slate-600">
                        {expense.type === "fixed"
                          ? `Dia ${expense.due_day}`
                          : new Date(expense.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="text-center py-3 px-4">
                        <Button
                          size="sm"
                          onClick={() =>
                            setPaymentModal({ open: true, expense })
                          }
                          className="bg-emerald-500 hover:bg-emerald-600"
                          data-testid={`mark-paid-btn-${expense.id}`}
                        >
                          Marcar como Pago
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses by Category */}
      {dashboard?.expenses_by_category?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.expenses_by_category.map((category) => (
                <div key={category.category_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.category_icon}</span>
                      <span className="font-medium text-slate-900">
                        {category.category_name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {formatCurrency(category.amount)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {category.percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                      style={{
                        width: `${(category.percentage || 0).toFixed(1)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

export default Dashboard;
