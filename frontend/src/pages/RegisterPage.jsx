import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authApi } from "../services/api";
import { Car } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.register(data);
      toast.success("Conta criada! Faça login.");
      navigate("/login");
    } catch (e) {
      const detail = e.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail[0]?.msg || 'Erro ao cadastrar'
          : 'Erro ao cadastrar';
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

        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-subtitle">Comece a controlar suas finanças</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input className="form-control" {...register("name", { required: "Nome obrigatório" })} />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="form-control" type="email" {...register("email", { required: "E-mail obrigatório" })} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-control" placeholder="(11) 99999-9999" {...register("phone")} />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                className="form-control"
                type="password"
                {...register("password", {
                  required: "Senha obrigatória",
                  minLength: { value: 6, message: "Mínimo 6 caracteres" }
                })}
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <div className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}