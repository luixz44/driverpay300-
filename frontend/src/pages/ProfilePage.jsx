import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { usersApi } from "../services/api";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone || "" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await usersApi.updateMe(data);
      await refreshUser();
      toast.success("Perfil atualizado!");
    } catch (e) {
      const detail = e.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail[0]?.msg || 'Erro ao atualizar' : 'Erro ao atualizar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-header">
        <h1 className="page-title">Meu Perfil</h1>
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 26, fontWeight: 700 }}>{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
            <div style={{ color: "var(--text-secondary)" }}>{user?.email}</div>
            <span className="badge badge-green" style={{ marginTop: 4 }}>Conta ativa</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input className="form-control" {...register("name", { required: "Nome obrigatório" })} />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="form-control" value={user?.email} disabled style={{ background: "var(--bg)", color: "var(--text-secondary)" }} />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input className="form-control" placeholder="(11) 99999-9999" {...register("phone")} />
          </div>
          <div className="form-group">
            <label className="form-label">Membro desde</label>
            <input className="form-control" value={user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : ""} disabled style={{ background: "var(--bg)", color: "var(--text-secondary)" }} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            <Save size={16} /> {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}