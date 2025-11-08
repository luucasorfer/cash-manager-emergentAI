import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import FixedExpenses from "./pages/FixedExpenses";
import VariableExpenses from "./pages/VariableExpenses";
import Incomes from "./pages/Incomes";
import EmergencyReserve from "./pages/EmergencyReserve";
import SavingsGoals from "./pages/SavingsGoals";
import Layout from "./components/Layout";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const apiClient = axios.create({
  baseURL: API,
});

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/fixed-expenses" element={<FixedExpenses />} />
            <Route path="/variable-expenses" element={<VariableExpenses />} />
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/emergency-reserve" element={<EmergencyReserve />} />
            <Route path="/savings-goals" element={<SavingsGoals />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
