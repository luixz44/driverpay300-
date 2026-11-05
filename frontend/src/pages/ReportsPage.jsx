import React, { useState } from "react";
import { reportsApi } from "../services/api";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import toast from "react-hot-toast";

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  window.URL.revokeObjectURL(url);
}

const reports = [
  { id: "rides-excel", label: "Corridas (Excel)", desc: "Todas as corridas em planilha .xlsx", icon: FileSpreadsheet, color: "#34a853", fn: () => reportsApi.ridesExcel(), filename: "corridas.xlsx" },
  { id: "expenses-excel", label: "Despesas (Excel)", desc: "Todas as despesas em planilha .xlsx", icon: FileSpreadsheet, color: "#34a853", fn: () => reportsApi.expensesExcel(), filename: "despesas.xlsx" },
  { id: "rides-pdf", label: "Corridas (PDF)", desc: "Relatório de corridas em PDF", icon: FileText, color: "#ea4335", fn: () => reportsApi.ridesPdf(), filename: "corridas.pdf" },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState({});

  const handleDownload = async (report) => {
    setLoading(l => ({ ...l, [report.id]: true }));
    try {
      const res = await report.fn();
      downloadBlob(res.data, report.filename);
      toast.success(`${report.label} baixado!`);
    } catch {
      toast.error("Erro ao gerar relatório");
    } finally {
      setLoading(l => ({ ...l, [report.id]: false }));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Relatórios</h1>
      </div>
      <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
        Exporte seus dados em Excel ou PDF para análise externa.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {reports.map(r => (
          <div key={r.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <r.icon size={22} color={r.color} />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r.desc}</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start", marginTop: "auto" }} onClick={() => handleDownload(r)} disabled={loading[r.id]}>
              <Download size={14} /> {loading[r.id] ? "Gerando..." : "Baixar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}