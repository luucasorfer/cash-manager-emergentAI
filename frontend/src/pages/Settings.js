import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { FolderKanban, FileText } from "lucide-react";
import Categories from "./Categories"; // importa o componente existente
import FixedExpenseTemplates from "./FixedExpenseTemplates"; // importa o componente de templates

const Settings = () => {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-600 mt-2">
          Gerencie suas categorias e templates fixos do sistema
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="categories"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">
            <FolderKanban className="mr-2 h-4 w-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="mr-2 h-4 w-4" />
            Templates Fixos
          </TabsTrigger>
        </TabsList>

        {/* Aba de Categorias */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
              <CardDescription>
                Crie, edite e exclua categorias de despesas e receitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Categories />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Templates Fixos */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Gastos Fixos</CardTitle>
              <CardDescription>
                Gerencie modelos de gastos fixos recorrentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FixedExpenseTemplates />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
