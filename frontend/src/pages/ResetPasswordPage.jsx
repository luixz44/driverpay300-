import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authApi } from "../services/api";
import { Car } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.resetPassword(data);
      toast.success("Senha redefinida com sucesso!");
      navigate("/login");
    } catch (e) {
      const detail = e.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail[0]?.msg || 'Erro ao redefinir senha'
          : 'Erro ao redefinir senha';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Car size={28} color="white" /></div>
        </div>
        <h1 className="auth-title">Redefinir senha</h1>
        <p className="auth-subtitle">Informe seu e-mail e a nova senha</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="form-control" type="email" {...register("email", { required: "Obrigatório" })} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Nova senha</label>
            <input
              className="form-control"
              type="password"
              {...register("new_password", {
                required: "Obrigatório",
                minLength: { value: 6, message: "Mínimo 6 caracteres" }
              })}
            />
            {errors.new_password && <p className="form-error">{errors.new_password.message}</p>}
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>
        <div className="auth-footer"><Link to="/login">Voltar ao login</Link></div>
      </div>
    </div>
  );
}