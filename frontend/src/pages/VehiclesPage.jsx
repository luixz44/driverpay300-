import React, { useEffect, useState } from "react";
import { vehiclesApi } from "../services/api";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, X, Car } from "lucide-react";
import toast from "react-hot-toast";

const FUEL_LABELS = { gasolina: "Gasolina", etanol: "Etanol", flex: "Flex", diesel: "Diesel", eletrico: "Elétrico" };

function VehicleModal({ vehicle, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: vehicle || {} });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (vehicle) { await vehiclesApi.update(vehicle.id, data); toast.success("Veículo atualizado!"); }
      else { await vehiclesApi.create(data); toast.success("Veículo cadastrado!"); }
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
          <h2 className="modal-title">{vehicle ? "Editar Veículo" : "Novo Veículo"}</h2>
          <button className="btn btn-outline btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Marca</label>
              <input className="form-control" {...register("brand", { required: "Obrigatório" })} />
              {errors.brand && <p className="form-error">{errors.brand.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input className="form-control" {...register("model", { required: "Obrigatório" })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ano</label>
              <input className="form-control" type="number" {...register("year", { required: true, valueAsNumber: true })} />
            </div>
            <div className="form-group">
              <label className="form-label">Placa</label>
              <input className="form-control" placeholder="ABC-1234" {...register("plate", { required: "Obrigatório" })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Combustível</label>
              <select className="form-control" {...register("fuel_type", { required: true })}>
                <option value="">Selecione</option>
                {Object.entries(FUEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">KM Atual</label>
              <input className="form-control" type="number" step="0.1" {...register("current_km", { valueAsNumber: true })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => vehiclesApi.list().then(r => setVehicles(r.data));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir veículo e todos os dados relacionados?")) return;
    try { await vehiclesApi.delete(id); toast.success("Excluído!"); load(); }
    catch (e) { toast.error("Erro ao excluir"); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Meus Veículos</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
          <Plus size={16} /> Novo Veículo
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🚗</div>
          <p style={{ fontWeight: 600 }}>Nenhum veículo cadastrado</p>
          <p style={{ marginBottom: 16 }}>Adicione seu primeiro veículo para começar</p>
          <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Adicionar</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {vehicles.map(v => (
            <div key={v.id} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Car size={24} color="#1a73e8" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{v.brand} {v.model}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{v.year} • {v.plate}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <span className="badge badge-blue">{FUEL_LABELS[v.fuel_type]}</span>
                <span className="badge badge-gray">{v.current_km?.toLocaleString("pt-BR")} km</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => { setEditing(v); setModal(true); }}><Pencil size={14} /> Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}><Trash2 size={14} /> Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <VehicleModal vehicle={editing} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); }} />}
    </div>
  );
}