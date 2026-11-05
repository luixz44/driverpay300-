import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { Car } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Bem-vindo de volta!");
      navigate("/");
    } catch (e) {
      const detail = e.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail[0]?.msg || 'Erro ao fazer login'
          : 'Erro ao fazer login';
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
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 20 }}>DriverApp</h2>
          </div>
        </div>

        <h1 className="auth-title">Entrar</h1>
        <p className="auth-subtitle">Gerencie suas corridas e finanças</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              className="form-control"
              type="email"
              placeholder="seu@email.com"
              {...register("email", { required: "E-mail obrigatório" })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              className="form-control"
              type="password"
              placeholder="••••••"
              {...register("password", { required: "Senha obrigatória" })}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/reset-password" style={{ color: "var(--primary)", textDecoration: "none" }}>Esqueceu a senha?</Link>
          <br /><br />
          Não tem conta? <Link to="/register">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}