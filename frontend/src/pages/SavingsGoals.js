import { useState, useEffect } from "react";
import { apiClient } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalFormData, setGoalFormData] = useState({
    name: "",
    description: "",
    target_amount: "",
    deadline: "",
    icon: "🎯",
  });
  const [contributionFormData, setContributionFormData] = useState({
    amount: "",
    description: "",
  });

  const commonIcons = ["🎯", "🏠", "🚗", "✈️", "📚", "💻", "🎉", "💎"];

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/savings_goals");
      setGoals(response.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Erro ao carregar metas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async () => {
    if (!goalFormData.name || !goalFormData.target_amount) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      await apiClient.post("/savings_goals", {
        ...goalFormData,
        target_amount: parseFloat(goalFormData.target_amount),
        deadline: goalFormData.deadline
          ? new Date(goalFormData.deadline).toISOString()
          : null,
      });
      toast.success("Meta criada com sucesso!");
      setGoalModalOpen(false);
      setGoalFormData({
        name: "",
        description: "",
        target_amount: "",
        deadline: "",
        icon: "🎯",
      });
      fetchGoals();
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Erro ao criar meta");
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta meta?")) return;

    try {
      await apiClient.delete(`/savings_goals/${id}`);
      toast.success("Meta excluída!");
      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Erro ao excluir meta");
    }
  };

  const handleCreateContribution = async () => {
    if (!contributionFormData.amount) {
      toast.error("Informe o valor");
      return;
    }

    try {
      await apiClient.post(`/savings_goals/${selectedGoal.id}/contributions`, {
        amount: parseFloat(contributionFormData.amount),
        description: contributionFormData.description,
      });
      toast.success("Contribuição adicionada!");
      setContributionModalOpen(false);
      setContributionFormData({ amount: "", description: "" });
      fetchGoals();
    } catch (error) {
      console.error("Error creating contribution:", error);
      toast.error("Erro ao adicionar contribuição");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="savings-goals-page">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Metas de Economia</h1>
        <Button
          onClick={() => setGoalModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600"
          data-testid="add-goal-btn"
        >
          <Plus size={20} className="mr-2" />
          Nova Meta
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Target size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Nenhuma meta cadastrada
            </h3>
            <p className="text-slate-600 mb-6">
              Comece definindo suas metas de economia!
            </p>
            <Button
              onClick={() => setGoalModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(
              goal.current_amount,
              goal.target_amount,
            );
            const remaining = goal.target_amount - goal.current_amount;

            return (
              <Card key={goal.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{goal.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        {goal.description && (
                          <p className="text-sm text-slate-600 mt-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-rose-600 hover:text-rose-700"
                      data-testid={`delete-goal-${goal.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(goal.current_amount)}
                      </span>
                      <span className="text-slate-600">
                        {formatCurrency(goal.target_amount)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-xs text-slate-600 text-center">
                      {progress.toFixed(1)}% concluído
                    </p>
                  </div>

                  {/* Status */}
                  {goal.is_completed ? (
                    <div className="p-3 bg-emerald-100 rounded-lg text-center">
                      <p className="text-sm font-semibold text-emerald-700">
                        ✓ Meta Concluída!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-100 rounded-lg">
                        <p className="text-xs text-slate-600">Faltam</p>
                        <p className="text-lg font-bold text-slate-900">
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                      {goal.deadline && (
                        <p className="text-xs text-slate-600 text-center">
                          Prazo:{" "}
                          {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {!goal.is_completed && (
                    <Button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setContributionModalOpen(true);
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                      data-testid={`contribute-btn-${goal.id}`}
                    >
                      <TrendingUp size={16} className="mr-2" />
                      Adicionar Contribuição
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Form Modal */}
      <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <DialogContent className="max-w-lg" data-testid="goal-modal">
          <DialogHeader>
            <DialogTitle>Nova Meta de Economia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Meta</Label>
              <Input
                id="name"
                value={goalFormData.name}
                onChange={(e) =>
                  setGoalFormData({ ...goalFormData, name: e.target.value })
                }
                placeholder="Ex: Viagem para Europa"
                data-testid="goal-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={goalFormData.description}
                onChange={(e) =>
                  setGoalFormData({
                    ...goalFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Detalhes sobre a meta..."
                rows={2}
                data-testid="goal-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_amount">Valor da Meta (R$)</Label>
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  value={goalFormData.target_amount}
                  onChange={(e) =>
                    setGoalFormData({
                      ...goalFormData,
                      target_amount: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  data-testid="goal-target-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Prazo (opcional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={goalFormData.deadline}
                  onChange={(e) =>
                    setGoalFormData({
                      ...goalFormData,
                      deadline: e.target.value,
                    })
                  }
                  data-testid="goal-deadline-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="grid grid-cols-8 gap-2">
                {commonIcons.map((icon, index) => (
                  <button
                    key={index}
                    onClick={() => setGoalFormData({ ...goalFormData, icon })}
                    className={`
                      text-3xl p-2 rounded-lg border-2 transition-all
                      ${
                        goalFormData.icon === icon
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }
                    `}
                    data-testid={`goal-icon-${index}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateGoal}
              className="bg-emerald-500 hover:bg-emerald-600"
              data-testid="create-goal-btn"
            >
              Criar Meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contribution Modal */}
      <Dialog
        open={contributionModalOpen}
        onOpenChange={setContributionModalOpen}
      >
        <DialogContent data-testid="contribution-modal">
          <DialogHeader>
            <DialogTitle>Adicionar Contribuição</DialogTitle>
            <p className="text-sm text-slate-600 mt-2">
              {selectedGoal?.icon} {selectedGoal?.name}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contribution_amount">Valor (R$)</Label>
              <Input
                id="contribution_amount"
                type="number"
                step="0.01"
                value={contributionFormData.amount}
                onChange={(e) =>
                  setContributionFormData({
                    ...contributionFormData,
                    amount: e.target.value,
                  })
                }
                placeholder="0.00"
                data-testid="contribution-amount-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contribution_description">
                Descrição (opcional)
              </Label>
              <Textarea
                id="contribution_description"
                value={contributionFormData.description}
                onChange={(e) =>
                  setContributionFormData({
                    ...contributionFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Observações..."
                rows={2}
                data-testid="contribution-description-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setContributionModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateContribution}
              className="bg-emerald-500 hover:bg-emerald-600"
              data-testid="save-contribution-btn"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavingsGoals;
