import React, { useEffect, useState } from "react";
import { ridesApi, vehiclesApi } from "../services/api";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

const APPS = ["Uber"," Chofer", "99", "InDrive", "Outros"];
const APP_COLORS = { Uber: "badge-blue", "99": "badge-green", InDrive: "badge-yellow", Outros: "badge-gray" };

function RideModal({ ride, vehicles, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues: ride ? { ...ride, date: ride.date?.slice(0, 16) } : {} });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
       const payload = { vehicle_id: parseInt(data.vehicle_id), value: parseFloat(data.value), distance_km: parseFloat(data.distance_km), app_used: data.app_used, notes: data.notes || "" };

      if (ride) { await ridesApi.update(ride.id, payload); toast.success("Corrida atualizada!"); }
      else { await ridesApi.create(payload); toast.success("Corrida registrada!"); }
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
          <h2 className="modal-title">{ride ? "Editar Corrida" : "Nova Corrida"}</h2>
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
              <label className="form-label">Aplicativo</label>
              <select className="form-control" {...register("app_used", { required: true })}>
                <option value="">Selecione</option>
                {APPS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valor (R$)</label>
              <input className="form-control" type="number" step="0.01" min="0" {...register("value", { required: true })} />
            </div>
            <div className="form-group">
              <label className="form-label">Distância (km)</label>
              <input className="form-control" type="number" step="0.1" min="0.1" {...register("distance_km", { required: true })} />
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

export default function RidesPage() {
  const [rides, setRides] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    vehiclesApi.list().then(r => {
      setVehicles(r.data);
      if (r.data.length > 0) setSelectedVehicle(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedVehicle) ridesApi.listByVehicle(selectedVehicle).then(r => setRides(r.data));
  }, [selectedVehicle]);

  const load = () => { if (selectedVehicle) ridesApi.listByVehicle(selectedVehicle).then(r => setRides(r.data)); };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir esta corrida?")) return;
    await ridesApi.delete(id); toast.success("Corrida excluída!"); load();
  };

  const totalRevenue = rides.reduce((s, r) => s + r.value, 0);
  const totalKm = rides.reduce((s, r) => s + r.distance_km, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Corridas</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}>
          <Plus size={16} /> Nova Corrida
        </button>
      </div>

      {vehicles.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <label className="form-label" style={{ margin: 0 }}>Veículo:</label>
          <select className="form-control" style={{ width: 220 }} value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate}</option>)}
          </select>
          <span className="badge badge-green">Total: R$ {totalRevenue.toFixed(2)}</span>
          <span className="badge badge-blue">{totalKm.toFixed(0)} km</span>
        </div>
      )}

      <div className="card">
        {rides.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🚗</div><p>Nenhuma corrida registrada</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                   <tr><th>Data</th><th>App</th><th>Valor</th><th>Distância</th><th>Ações</th></tr>

              </thead>
              <tbody>
                {rides.map(r => (
                  <tr key={r.id}>
                      <td>{format(new Date(r.created_at), "dd/MM/yyyy HH:mm")}</td>
                    <td><span className={`badge ${APP_COLORS[r.app_used] || "badge-gray"}`}>{r.app_used}</span></td>
                    <td style={{ fontWeight: 600 }} className="text-success">R$ {r.value.toFixed(2)}</td>
                    <td>{r.distance_km.toFixed(1)} km</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditing(r); setModal(true); }}><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <RideModal ride={editing} vehicles={vehicles} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); }} />}
    </div>
  );
}