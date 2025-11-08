import { useState, useEffect } from 'react';
import { apiClient } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });

  const commonIcons = [
    '🏠', '💼', '👗', '📚', '🎲', '🍽️', '🚗', '🛍️', 
    '🍔', '🐶', '🎮', '🎬', '❤️‍🩹', '💳', '📊', '🎯'
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategory.name || !newCategory.icon) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await apiClient.post('/categories', newCategory);
      toast.success('Categoria criada com sucesso!');
      setModalOpen(false);
      setNewCategory({ name: '', icon: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Erro ao criar categoria');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      await apiClient.delete(`/categories/${id}`);
      toast.success('Categoria excluída com sucesso!');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="categories-page">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Categorias</h1>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600"
          data-testid="add-category-btn"
        >
          <Plus size={20} className="mr-2" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{category.icon}</span>
                  <span className="font-semibold text-slate-900">{category.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  data-testid={`delete-category-${category.id}`}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-testid="category-modal">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Ex: Alimentação"
                data-testid="category-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="grid grid-cols-8 gap-2">
                {commonIcons.map((icon, index) => (
                  <button
                    key={index}
                    onClick={() => setNewCategory({ ...newCategory, icon })}
                    className={`
                      text-3xl p-2 rounded-lg border-2 transition-all
                      ${newCategory.icon === icon 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-slate-300'
                      }
                    `}
                    data-testid={`icon-${index}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-emerald-500 hover:bg-emerald-600"
              data-testid="create-category-btn"
            >
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
