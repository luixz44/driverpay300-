import React, { useEffect, useState } from "react";
import { dashboardApi } from "../services/api";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Navigation, Gauge } from "lucide-react";

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

function StatCard({ label, value, icon: Icon, color, bg, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div>
          <p className="stat-card-label">{label}</p>
          <p className="stat-card-value">{value}</p>
          {sub && <p className="stat-card-sub">{sub}</p>}
        </div>
        <div className="stat-card-icon" style={{ background: bg }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardApi.get(year)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <p>Carregando dashboard...</p>;
  if (!data) return <p>Erro ao carregar dados.</p>;

  const profitData = data.monthly_revenue.map((r, i) => ({
    month: r.month,
    Receita: r.total,
    Despesas: data.monthly_expenses[i]?.total || 0,
    Lucro: data.monthly_profit[i]?.total || 0,
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Visão Geral</h1>
        <select className="form-control" style={{ width: 120 }} value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="stats-grid">
        <StatCard label="Receita Total" value={fmt(data.total_revenue)} icon={TrendingUp} color="#34a853" bg="#e6f4ea" />
        <StatCard label="Despesas Totais" value={fmt(data.total_expenses)} icon={TrendingDown} color="#ea4335" bg="#fce8e6" />
        <StatCard label="Lucro Líquido" value={fmt(data.net_profit)} icon={DollarSign}
          color={data.net_profit >= 0 ? "#34a853" : "#ea4335"}
          bg={data.net_profit >= 0 ? "#e6f4ea" : "#fce8e6"}
        />
        <StatCard label="KM Rodados" value={`${Number(data.total_km || 0).toLocaleString("pt-BR")} km`} icon={Navigation} color="#1a73e8" bg="#e8f0fe" />
        <StatCard label="Consumo Médio" value={data.avg_consumption ? `${data.avg_consumption.toFixed(1)} L/100km` : "—"} icon={Gauge} color="#fbbc04" bg="#fef7e0" />
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header"><h3 className="card-title">Receita vs Despesas ({year})</h3></div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${v}`} />
              <Tooltip formatter={v => fmt(v)} />
              <Legend />
              <Bar dataKey="Receita" fill="#1a73e8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="#ea4335" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Lucro Mensal ({year})</h3></div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${v}`} />
              <Tooltip formatter={v => fmt(v)} />
              <Line type="monotone" dataKey="Lucro" stroke="#34a853" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">KM por Mês ({year})</h3></div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthly_km}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => `${v.toFixed(0)} km`} />
              <Bar dataKey="total" name="KM" fill="#fbbc04" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}