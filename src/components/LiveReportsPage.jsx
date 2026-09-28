import { useEffect, useState } from "react";
import { Download, FileDown, FileText } from "lucide-react";
import { Card, PanelHeader } from "./Card";
import { loadLiveDevices } from "../data/liveDeviceStorage";
import { supabase } from "../lib/supabase";

const PERIODS = { "24 hours": 24, "7 days": 24 * 7, "30 days": 24 * 30 };
const REPORT_TYPES = ["Water level history", "Temperature and humidity", "Relay state"];

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadCsv(rows, type, period) {
  const headers = Object.keys(rows[0]);
  const csv = [headers, ...rows.map((row) => headers.map((header) => row[header]))]
    .map((line) => line.map(csvCell).join(","))
    .join("\r\n");
  const link = document.createElement("a");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  link.href = url;
  link.download = `luntian-${type.toLowerCase().replaceAll(" ", "-")}-${period.toLowerCase().replaceAll(" ", "-")}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadPdf(rows, type, period) {
  const [pdfModule, tableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new pdfModule.jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const margin = 15;
  doc.setProperties({ title: `LUNTIAN ${type}`, subject: period });
  doc.setFillColor(35, 69, 43);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 29, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`LUNTIAN - ${type}`, margin, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${period} - Generated ${new Date().toLocaleString()}`, margin, 22);
  tableModule.default(doc, {
    startY: 35,
    margin: { left: margin, right: margin, bottom: 15 },
    head: [Object.keys(rows[0])],
    body: rows.map((row) => Object.values(row).map((value) => String(value ?? ""))),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
    headStyles: { fillColor: [35, 69, 43], textColor: [255, 255, 255] },
    didDrawPage: (data) => {
      doc.setTextColor(104, 119, 108);
      doc.setFontSize(8);
      doc.text(`Page ${data.pageNumber}`, doc.internal.pageSize.getWidth() - margin, doc.internal.pageSize.getHeight() - 7, { align: "right" });
    },
  });
  doc.save(`luntian-${type.toLowerCase().replaceAll(" ", "-")}-${period.toLowerCase().replaceAll(" ", "-")}.pdf`);
}

export default function LiveReportsPage({ userId }) {
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("all");
  const [period, setPeriod] = useState("7 days");
  const [type, setType] = useState(REPORT_TYPES[0]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    if (!userId) { setDevices([]); setIsLoading(false); return undefined; }
    loadLiveDevices(userId).then((result) => {
      if (isCurrent) setDevices(result);
    }).catch((loadError) => {
      if (isCurrent) setError(loadError.message);
    });
    return () => { isCurrent = false; };
  }, [userId]);

  useEffect(() => {
    let isCurrent = true;
    if (!userId || !supabase) { setRows([]); setIsLoading(false); return undefined; }
    const cutoff = new Date(Date.now() - PERIODS[period] * 60 * 60 * 1000).toISOString();
    let query = supabase.from("device_telemetry")
      .select("device_id, measured_at, temperature_c, humidity_pct, water_distance_cm, water_level_pct, temp_relay_on, water_relay_on, temp_overheat, water_full, dht_sensor_fault, water_sensor_fault")
      .eq("owner_id", userId)
      .gte("measured_at", cutoff)
      .order("measured_at", { ascending: false })
      .limit(5000);
    if (deviceId !== "all") query = query.eq("device_id", deviceId);
    query.then(({ data, error: queryError }) => {
      if (!isCurrent) return;
      if (queryError) setError(queryError.message);
      else { setRows(data || []); setError(""); }
    }).finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, [userId, period, deviceId]);

  const deviceNames = new Map(devices.map((device) => [device.device_id, device.display_name]));
  const reportRows = rows.map((row) => {
    const common = { Device: deviceNames.get(row.device_id) || row.device_id, "Measured at": new Date(row.measured_at).toLocaleString() };
    if (type === "Water level history") return { ...common, "Tank level (%)": row.water_level_pct, "Distance to water (cm)": row.water_distance_cm, "Sensor fault": row.water_sensor_fault ? "Yes" : "No", "Tank full": row.water_full ? "Yes" : "No" };
    if (type === "Temperature and humidity") return { ...common, "Temperature (C)": row.temperature_c, "Humidity (%)": row.humidity_pct, "DHT22 fault": row.dht_sensor_fault ? "Yes" : "No" };
    return { ...common, "Temperature outlet": row.temp_relay_on ? "ON" : "OFF", "Water inlet": row.water_relay_on ? "ON" : "OFF", "Overheat cutoff": row.temp_overheat ? "Active" : "Clear", "Tank-full cutoff": row.water_full ? "Active" : "Clear" };
  });
  const latest = rows[0] || null;
  const errorCount = rows.filter((row) => row.water_sensor_fault || row.dht_sensor_fault).length;

  const exportFile = async (format) => {
    if (!reportRows.length) return;
    setIsExporting(true);
    setMessage("");
    try {
      if (format === "CSV") downloadCsv(reportRows, type, period);
      else await downloadPdf(reportRows, type, period);
      setMessage(`${format} report downloaded.`);
    } catch (exportError) {
      setMessage(exportError.message || `${format} export failed.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <PanelHeader title="LIVE TELEMETRY REPORT" right={<FileText size={16} className="text-muted" />} />
        <div className="flex flex-wrap items-end gap-3 px-5 py-4">
          <label className="text-xs font-medium text-muted">Report type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 block rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">{REPORT_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs font-medium text-muted">Period<select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1 block rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">{Object.keys(PERIODS).map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs font-medium text-muted">Device<select value={deviceId} onChange={(event) => setDeviceId(event.target.value)} className="mt-1 block min-w-52 rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"><option value="all">All registered devices</option>{devices.map((device) => <option key={device.device_id} value={device.device_id}>{device.display_name}</option>)}</select></label>
        </div>
      </Card>
      {error && <p role="alert" className="text-sm text-crit">Could not load report data: {error}</p>}
      <Card>
        <PanelHeader title={`${type.toUpperCase()} - ${period.toUpperCase()}`} right={<span className="text-xs text-muted">{deviceId === "all" ? "All devices" : deviceNames.get(deviceId)}</span>} />
        <div className="grid gap-3 px-5 py-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-canvas p-3"><div className="text-xs text-muted">Recorded samples</div><div className="mt-1 text-xl font-bold text-ink">{isLoading ? "--" : rows.length}</div></div>
          <div className="rounded-lg border border-border bg-canvas p-3"><div className="text-xs text-muted">Latest reading</div><div className="mt-1 text-sm font-bold text-ink">{latest ? new Date(latest.measured_at).toLocaleString() : "No data"}</div></div>
          <div className="rounded-lg border border-border bg-canvas p-3"><div className="text-xs text-muted">Samples with sensor faults</div><div className="mt-1 text-xl font-bold text-ink">{isLoading ? "--" : errorCount}</div></div>
        </div>
        <div className="overflow-x-auto">
          {reportRows.length ? <table className="w-full min-w-[680px] text-sm"><thead><tr className="border-y border-border bg-canvas/60 text-left text-xs text-muted">{Object.keys(reportRows[0]).map((key) => <th key={key} className="px-4 py-3 font-medium">{key}</th>)}</tr></thead><tbody className="divide-y divide-border">{reportRows.slice(0, 200).map((row, index) => <tr key={`${row.Device}-${row["Measured at"]}-${index}`}>{Object.values(row).map((value, cellIndex) => <td key={cellIndex} className="px-4 py-3 text-ink">{value ?? "--"}</td>)}</tr>)}</tbody></table> : <p className="py-10 text-center text-sm text-muted">{isLoading ? "Loading recorded telemetry..." : "No telemetry records in the selected period."}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <span className="text-xs text-muted">Exports contain recorded sensor/controller readings only. No electricity or water-flow totals are inferred.</span>
          <div className="flex items-center gap-2">
            {message && <span role="status" className="text-xs text-accent">{message}</span>}
            <button type="button" onClick={() => exportFile("CSV")} disabled={!reportRows.length || isExporting} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-canvas disabled:opacity-50"><Download size={15} />CSV</button>
            <button type="button" onClick={() => exportFile("PDF")} disabled={!reportRows.length || isExporting} className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-[#376A34] disabled:opacity-50"><FileDown size={15} />{isExporting ? "Preparing" : "PDF"}</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
