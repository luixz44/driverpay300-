import React, { useEffect, useState } from "react";
import { expensesApi, vehiclesApi } from "../services/api";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

const EXPENSE_TYPES = {
  combustivel: "⛽ Combustível", manutencao: "🔧 Manutenção", lavagem: "🫧 Lavagem",
  seguro: "🛡️ Seguro", ipva: "📋 IPVA", multa: "⚠️ Multa", outros: "📦 Outros",
};
const TYPE_COLORS = { combustivel: "badge-blue", manutencao: "badge-red", seguro: "badge-green", ipva: "badge-yellow", multa: "badge-red", outros: "badge-gray", lavagem: "badge-blue" };

function ExpenseModal({ expense, vehicles, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues: expense ? { ...expense, date: expense.date?.slice(0, 10) } : {} });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, value: parseFloat(data.value), vehicle_id: parseInt(data.vehicle_id) };
      if (expense) { await expensesApi.update(expense.id, payload); toast.success("Despesa atualizada!"); }
      else { await expensesApi.create(payload); toast.success("Despesa registrada!"); }
      onSaved();
    } catch (e) {
      const detail = e.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail[0]?.msg || 'Erro ao salvar' : 'Erro ao salvar';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{expense ? "Editar Despesa" : "Nova Despesa"}</h2>
          <button className="btn btn-outline btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Veículo</label>
              <select className="form-control" {...register("vehicle_id", { required: true })}>
                <option value="">Selecione</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-control" {...register("type", { required: true })}>
                <option value="">Selecione</option>
                {Object.entries(EXPENSE_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data</label>
              <input className="form-control" type="date" {...register("date", { required: true })} />
            </div>
            <div className="form-group">
              <label className="form-label">Valor (R$)</label>
              <input className="form-control" type="number" step="0.01" min="0.01" {...register("value", { required: true })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Observações</label>
            <input className="form-control" {...register("notes")} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    vehiclesApi.list().then(r => { setVehicles(r.data); if (r.data.length > 0) setSelectedVehicle(r.data[0].id); });
  }, []);
  useEffect(() => {
    if (selectedVehicle) expensesApi.listByVehicle(selectedVehicle).then(r => setExpenses(r.data));
  }, [selectedVehicle]);

  const load = () => { if (selectedVehicle) expensesApi.listByVehicle(selectedVehicle).then(r => setExpenses(r.data)); };
  const handleDelete = async (id) => {
    if (!window.confirm("Excluir despesa?")) return;
    await expensesApi.delete(id); toast.success("Excluída!"); load();
  };

  const total = expenses.reduce((s, e) => s + e.value, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Despesas</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
          <Plus size={16} /> Nova Despesa
        </button>
      </div>

      {vehicles.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <label className="form-label" style={{ margin: 0 }}>Veículo:</label>
          <select className="form-control" style={{ width: 220 }} value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate}</option>)}
          </select>
          <span className="badge badge-red">Total: R$ {total.toFixed(2)}</span>
        </div>
      )}

      <div className="card">
        {expenses.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">💸</div><p>Nenhuma despesa registrada</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Data</th><th>Tipo</th><th>Valor</th><th>Obs.</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td>{format(new Date(e.date), "dd/MM/yyyy")}</td>
                    <td><span className={`badge ${TYPE_COLORS[e.type] || "badge-gray"}`}>{EXPENSE_TYPES[e.type]}</span></td>
                    <td style={{ fontWeight: 600 }} className="text-danger">R$ {e.value.toFixed(2)}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{e.notes || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditing(e); setModal(true); }}><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && <ExpenseModal expense={editing} vehicles={vehicles} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); }} />}
    </div>
  );
}