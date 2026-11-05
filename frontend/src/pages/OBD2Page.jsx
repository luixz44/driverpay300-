import React, { useEffect, useState, useRef } from "react";
import { obd2Api, vehiclesApi } from "../services/api";
import { Bluetooth, BluetoothOff, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function OBD2Page() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [connected, setConnected] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    vehiclesApi.list().then(r => { setVehicles(r.data); if (r.data.length > 0) setSelectedVehicle(r.data[0].id); });
    return () => clearInterval(intervalRef.current);
  }, []);

  const simulateLiveData = () => ({
    rpm: Math.round(800 + Math.random() * 3200),
    speed_kmh: Math.round(Math.random() * 120),
    engine_temp_c: Math.round(80 + Math.random() * 20),
    instant_consumption: parseFloat((4 + Math.random() * 8).toFixed(1)),
    odometer_km: parseFloat((50000 + Math.random() * 100).toFixed(1)),
    engine_runtime_s: Math.round(Math.random() * 3600),
  });

  const handleConnect = async () => {
    if (!selectedVehicle) { toast.error("Selecione um veículo primeiro"); return; }
    toast.success("Conectado ao OBD2!");
    setConnected(true);
    intervalRef.current = setInterval(async () => {
      const data = simulateLiveData();
      setLiveData(data);
      try {
        const res = await obd2Api.record({ vehicle_id: parseInt(selectedVehicle), ...data });
        setHistory(prev => [res.data, ...prev.slice(0, 49)]);
      } catch { }
    }, 3000);
  };

  const handleDisconnect = () => {
    clearInterval(intervalRef.current);
    setConnected(false);
    setLiveData(null);
    toast("Desconectado do OBD2");
  };

  useEffect(() => {
    if (selectedVehicle) obd2Api.history(selectedVehicle, 20).then(r => setHistory(r.data));
  }, [selectedVehicle]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">OBD2 Bluetooth</h1>
        <div className="connection-status">
          <div className={`status-dot ${connected ? "connected" : "disconnected"}`} />
          {connected ? "Conectado" : "Desconectado"}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <select className="form-control" style={{ width: 240 }} value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} disabled={connected}>
            <option value="">Selecione o veículo</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate}</option>)}
          </select>
          {!connected ? (
            <button className="btn btn-primary" onClick={handleConnect}>
              <Bluetooth size={16} /> Conectar OBD2
            </button>
          ) : (
            <button className="btn btn-danger" onClick={handleDisconnect}>
              <BluetoothOff size={16} /> Desconectar
            </button>
          )}
          <div style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 380 }}>
             No Aplicativo, a conexão Bluetooth real com o adaptador OBD2 é feita automaticamente.
          </div>
        </div>
      </div>

      {connected && liveData ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Activity size={18} color="var(--success)" />
            <span style={{ fontWeight: 600, color: "var(--success)" }}>Dados em tempo real</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}></span>
          </div>
          <div className="obd2-grid">
            <div className="obd2-metric">
              <div className="obd2-metric-value">{liveData.rpm?.toLocaleString()}</div>
              <div className="obd2-metric-unit">RPM</div>
              <div className="obd2-metric-label">Rotações por minuto</div>
            </div>
            <div className="obd2-metric">
              <div className="obd2-metric-value">{liveData.speed_kmh}</div>
              <div className="obd2-metric-unit">km/h</div>
              <div className="obd2-metric-label">Velocidade</div>
            </div>
            <div className="obd2-metric">
              <div className="obd2-metric-value">{liveData.engine_temp_c}°</div>
              <div className="obd2-metric-unit">Celsius</div>
              <div className="obd2-metric-label">Temperatura do motor</div>
            </div>
            <div className="obd2-metric">
              <div className="obd2-metric-value">{liveData.instant_consumption}</div>
              <div className="obd2-metric-unit">L/100km</div>
              <div className="obd2-metric-label">Consumo instantâneo</div>
            </div>
            <div className="obd2-metric">
              <div className="obd2-metric-value">{liveData.odometer_km?.toLocaleString("pt-BR")}</div>
              <div className="obd2-metric-unit">km</div>
              <div className="obd2-metric-label">Odômetro</div>
            </div>
            <div className="obd2-metric">
              <div className="obd2-metric-value">{Math.round((liveData.engine_runtime_s || 0) / 60)}</div>
              <div className="obd2-metric-unit">min</div>
              <div className="obd2-metric-label">Tempo ligado</div>
            </div>
          </div>
        </div>
      ) : (
        !connected && <div className="card empty-state">
          <div className="empty-state-icon">🔌</div>
          <p style={{ fontWeight: 600 }}>Nenhuma leitura ativa</p>
          <p>Conecte o adaptador OBD2 e clique em "Conectar OBD2"</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><h3 className="card-title">Histórico OBD2</h3></div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Data/Hora</th><th>RPM</th><th>Velocidade</th><th>Temp. Motor</th><th>Consumo</th><th>Odômetro</th></tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontSize: 12 }}>{format(new Date(h.timestamp), "dd/MM HH:mm:ss")}</td>
                    <td>{h.rpm?.toLocaleString() || "—"}</td>
                    <td>{h.speed_kmh ? `${h.speed_kmh} km/h` : "—"}</td>
                    <td>{h.engine_temp_c ? `${h.engine_temp_c}°C` : "—"}</td>
                    <td>{h.instant_consumption ? `${h.instant_consumption} L/100km` : "—"}</td>
                    <td>{h.odometer_km ? `${h.odometer_km?.toLocaleString("pt-BR")} km` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}