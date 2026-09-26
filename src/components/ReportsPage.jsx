import { useMemo, useState } from "react";
import { Download, FileDown, FileText } from "lucide-react";
import { Card, PanelHeader } from "./Card";
import { buildings, ELECTRICITY_EMISSIONS_KG_PER_KWH, getBuildingConsumptionKwh } from "../data/buildings";
import { waterTanksByBuilding } from "../data/waterTanks";

const outletSamples = [
  { building: "College of Engineering", outlet: "Aircon · Room 204", status: "ON", power: "3.2 kW" },
  { building: "College of Engineering", outlet: "Aircon · Room 205", status: "OFF", power: "0 kW" },
  { building: "CCS IT Laboratory", outlet: "Lab workstation bank", status: "ON", power: "2.8 kW" },
  { building: "ESSU Infirmary", outlet: "Aircon · Room 101", status: "OFF", power: "0 kW" },
  { building: "Administration Building", outlet: "Records office outlet", status: "Offline", power: "No reading" },
];

const alertSamples = [
  { building: "College of Engineering", severity: "Critical", status: "Open", detail: "Usage is 28% higher than normal" },
  { building: "ESSU Infirmary", severity: "Warning", status: "Open", detail: "Water consumption is unusually high" },
  { building: "College of Engineering", severity: "Warning", status: "Acknowledged", detail: "Outlet active outside scheduled hours" },
  { building: "College of Science Building", severity: "Info", status: "Open", detail: "Water sensor is offline" },
  { building: "CCS IT Laboratory", severity: "Critical", status: "Resolved", detail: "Smart outlet not responding" },
];

function getRows(type, scope, period) {
  const selected = scope === "All buildings" ? buildings : buildings.filter((building) => building.name === scope);
  const days = period === "This week" ? 7 : 30;

  if (type === "Smart Outlet Status") {
    return outletSamples.filter((outlet) => scope === "All buildings" || outlet.building === scope).map((outlet) => ({
      building: outlet.building,
      consumption: 1,
      unit: "outlets",
      status: outlet.status,
      detail: `${outlet.outlet} · ${outlet.power}`,
    }));
  }

  if (type === "Alerts") {
    return alertSamples.filter((alert) => scope === "All buildings" || alert.building === scope).map((alert) => ({
      building: alert.building,
      consumption: 1,
      unit: "alerts",
      status: `${alert.severity} · ${alert.status}`,
      detail: alert.detail,
    }));
  }

  if (type === "Energy Savings") {
    return selected.map((building) => {
      const dailyKwh = getBuildingConsumptionKwh(building);
      return {
        building: building.name,
        consumption: Math.round(dailyKwh * days * 0.1),
        unit: "kWh saved",
        status: "Estimate",
        detail: "Assumes 10% reduction from daily sample use",
      };
    });
  }

  if (type === "Carbon Emissions") {
    return selected.map((building) => {
      const dailyKwh = getBuildingConsumptionKwh(building);
      const dailyEmissionsKg = dailyKwh * ELECTRICITY_EMISSIONS_KG_PER_KWH;
      return {
        building: building.name,
        consumption: dailyEmissionsKg * days,
        unit: "kg CO₂e",
        status: "Estimate",
        detail: `${dailyEmissionsKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e/day · ${dailyKwh.toLocaleString()} kWh/day`,
      };
    });
  }

  return selected.map((building) => {
    if (type === "Water Consumption") {
      const tanks = waterTanksByBuilding[building.name] || [];
      const dailyTotal = tanks.reduce((sum, tank) => sum + tank.dailyConsumptionL, 0);
      const capacity = tanks.reduce((sum, tank) => sum + tank.capacityL, 0);
      const stored = tanks.reduce((sum, tank) => sum + Math.round(tank.capacityL * tank.levelPct / 100), 0);
      return { building: building.name, consumption: dailyTotal * days, unit: "L", status: `${tanks.length} tanks`, detail: `${dailyTotal.toLocaleString()} L/day · ${stored.toLocaleString()} / ${capacity.toLocaleString()} L stored` };
    }
    const dailyKwh = getBuildingConsumptionKwh(building);
    return {
      building: building.name,
      consumption: dailyKwh * days,
      unit: "kWh",
      emissionsKg: dailyKwh * days * ELECTRICITY_EMISSIONS_KG_PER_KWH,
      status: building.status,
      detail: `${dailyKwh.toLocaleString()} kWh/day · ${building.pct} of reference use`,
    };
  });
}

function downloadCsv({ rows, type, period, scope, summary }) {
  const hasEmissionsColumn = type === "Electricity Consumption";
  const headers = ["Building", "Value", "Unit", ...(hasEmissionsColumn ? ["Emissions (kg CO₂e)"] : []), "Status", "Details"];
  const values = rows.map((row) => [row.building, row.consumption, row.unit, ...(hasEmissionsColumn ? [row.emissionsKg] : []), row.status, row.detail]);
  const report = [
    ["LUNTIAN RESOURCE MANAGEMENT"],
    [`${type} Report`],
    ["Reporting period", period],
    ["Scope", scope],
    ["Generated", new Date().toLocaleString()],
    [],
    ["REPORT SUMMARY"],
    ["Metric", "Value"],
    [summary.totalLabel, `${summary.total.toLocaleString()} ${summary.unit}`],
    [summary.averageLabel, `${summary.average.toLocaleString()} ${summary.unit}`],
    ...(hasEmissionsColumn ? [["Carbon emissions total", `${summary.carbonTotalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e`]] : []),
    [summary.highestLabel, summary.topBuilding ? `${summary.topBuilding.building} · ${summary.topBuilding.consumption.toLocaleString()} ${summary.unit}` : "No data"],
    [],
    ["BUILDING DETAILS"],
    headers,
    ...values,
  ];
  const csv = report.map((line) => line.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `luntian-${type.toLowerCase().replaceAll(" ", "-")}-${period.toLowerCase().replaceAll(" ", "-")}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadPdf({ rows, type, period, scope, summary }) {
  const [pdfModule, tableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const { jsPDF } = pdfModule;
  const autoTable = tableModule.default;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const generatedAt = new Date().toLocaleString();
  const cardGap = 5;
  const hasEmissionsColumn = type === "Electricity Consumption";
  const summaries = [
    { label: summary.totalLabel, value: `${summary.total.toLocaleString()} ${summary.unit}` },
    { label: summary.averageLabel, value: `${summary.average.toLocaleString()} ${summary.unit}` },
    { label: summary.highestLabel, value: summary.topBuilding?.building || "No data", detail: summary.topBuilding ? `${summary.topBuilding.consumption.toLocaleString()} ${summary.unit}` : "" },
  ];
  if (hasEmissionsColumn) {
    summaries.splice(1, 0, { label: "Carbon emissions", value: `${summary.carbonTotalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e` });
  }
  const cardWidth = (pageWidth - margin * 2 - cardGap * (summaries.length - 1)) / summaries.length;

  doc.setProperties({ title: `${type} Report`, subject: `${period} · ${scope}`, author: "Luntian Resource Management" });
  doc.setFillColor(35, 69, 43);
  doc.rect(0, 0, pageWidth, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("LUNTIAN  /  RESOURCE MANAGEMENT", margin, 12);
  doc.setFontSize(19);
  doc.text(`${type} Report`, margin, 23);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${period}  ·  ${scope}`, pageWidth - margin, 19, { align: "right" });

  doc.setTextColor(80, 96, 86);
  doc.setFontSize(8);
  doc.text(`Generated ${generatedAt}`, margin, 42);
  doc.text("LUNTIAN RESOURCE MANAGEMENT  /  OPERATIONS REPORT", pageWidth - margin, 42, { align: "right" });

  summaries.forEach((item, index) => {
    const x = margin + index * (cardWidth + cardGap);
    doc.setDrawColor(222, 230, 224);
    doc.setFillColor(247, 249, 247);
    doc.roundedRect(x, 49, cardWidth, 25, 2, 2, "FD");
    doc.setTextColor(104, 119, 108);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(item.label, x + 4, 56);
    doc.setTextColor(27, 35, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(index === 2 ? 11 : 14);
    const displayValue = doc.splitTextToSize(item.value, cardWidth - 8);
    doc.text(displayValue, x + 4, 65);
    if (item.detail) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(104, 119, 108);
      doc.text(item.detail, x + 4, 71);
    }
  });

  autoTable(doc, {
    startY: 82,
    margin: { left: margin, right: margin, bottom: 17 },
    head: [["Building", "Value", "Unit", ...(hasEmissionsColumn ? ["Emissions (kg CO₂e)"] : []), "Status", "Details"]],
    body: rows.map((row) => [row.building, row.consumption.toLocaleString(), row.unit, ...(hasEmissionsColumn ? [row.emissionsKg.toLocaleString(undefined, { maximumFractionDigits: 1 })] : []), row.status, row.detail]),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 3, textColor: [43, 56, 47], lineColor: [222, 230, 224], lineWidth: 0.2, overflow: "linebreak" },
    headStyles: { fillColor: [35, 69, 43], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [246, 249, 246] },
    columnStyles: hasEmissionsColumn
      ? { 0: { cellWidth: 48 }, 1: { cellWidth: 22, halign: "right" }, 2: { cellWidth: 19 }, 3: { cellWidth: 30, halign: "right" }, 4: { cellWidth: 25 }, 5: { cellWidth: "auto" } }
      : { 0: { cellWidth: 54 }, 1: { cellWidth: 24, halign: "right" }, 2: { cellWidth: 24 }, 3: { cellWidth: 33 }, 4: { cellWidth: "auto" } },
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setDrawColor(222, 230, 224);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.setTextColor(104, 119, 108);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Sample data · Period totals are extrapolated from daily readings where history is unavailable.", margin, pageHeight - 7);
      doc.text(`Page ${data.pageNumber}`, pageWidth - margin, pageHeight - 7, { align: "right" });
    },
  });

  doc.save(`luntian-${type.toLowerCase().replaceAll(" ", "-")}-${period.toLowerCase().replaceAll(" ", "-")}.pdf`);
}

export default function ReportsPage() {
  const [type, setType] = useState("Electricity Consumption");
  const [period, setPeriod] = useState("This month");
  const [scope, setScope] = useState("All buildings");
  const [applied, setApplied] = useState({ type, period, scope });
  const [exportMessage, setExportMessage] = useState("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const rows = useMemo(() => getRows(applied.type, applied.scope, applied.period), [applied]);
  const total = rows.reduce((sum, row) => sum + row.consumption, 0);
  const uniqueBuildings = new Set(rows.map((row) => row.building)).size;
  const average = rows.length
    ? Math.round(total / (applied.type === "Alerts" ? uniqueBuildings : rows.length))
    : 0;
  const topBuilding = rows.reduce((top, row) => row.consumption > (top?.consumption ?? -1) ? row : top, null);
  const unit = rows[0]?.unit || "kWh";
  const totalLabel = applied.type === "Alerts"
    ? "Alerts in report"
    : applied.type === "Smart Outlet Status"
      ? "Outlet readings"
      : applied.type === "Energy Savings"
        ? "Estimated savings"
        : applied.type === "Carbon Emissions"
          ? "Carbon emissions total"
        : "Estimated period total";
  const averageLabel = applied.type === "Alerts"
    ? "Average alerts per building"
      : applied.type === "Smart Outlet Status"
        ? "Outlet records per building"
        : applied.type === "Carbon Emissions"
          ? "Average emissions per building"
          : "Average per building";
  const highestLabel = applied.type === "Alerts"
    ? "First affected building"
    : applied.type === "Smart Outlet Status"
      ? "Highest outlet demand"
      : applied.type === "Energy Savings"
        ? "Highest estimated saving"
        : applied.type === "Carbon Emissions"
          ? "Highest building emissions"
        : "Highest building use";
  const exportSummary = { total, average, unit, totalLabel, averageLabel, highestLabel, topBuilding };
  exportSummary.carbonTotalKg = applied.type === "Carbon Emissions"
    ? total
    : applied.type === "Electricity Consumption"
      ? total * ELECTRICITY_EMISSIONS_KG_PER_KWH
      : null;

  const generateReport = (event) => {
    event.preventDefault();
    setApplied({ type, period, scope });
  };

  const exportData = { rows, type: applied.type, period: applied.period, scope: applied.scope, summary: exportSummary };

  const handleCsvExport = () => {
    try {
      downloadCsv(exportData);
      setExportMessage("CSV report downloaded.");
    } catch {
      setExportMessage("CSV export failed. Please try again.");
    }
  };

  const handlePdfExport = async () => {
    setIsExportingPdf(true);
    setExportMessage("");
    try {
      await downloadPdf(exportData);
      setExportMessage("PDF report downloaded.");
    } catch {
      setExportMessage("PDF export failed. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <PanelHeader title="REPORT BUILDER" right={<FileText size={16} className="text-muted" />} />
        <form onSubmit={generateReport} className="flex flex-wrap items-end gap-3 px-5 py-4">
          <label className="text-xs font-medium text-muted">Report type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 block rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"><option>Electricity Consumption</option><option>Carbon Emissions</option><option>Water Consumption</option><option>Smart Outlet Status</option><option>Alerts</option><option>Energy Savings</option></select></label>
          <label className="text-xs font-medium text-muted">Period<select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1 block rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"><option>This month</option><option>Last month</option><option>This week</option></select></label>
          <label className="text-xs font-medium text-muted">Scope<select value={scope} onChange={(event) => setScope(event.target.value)} className="mt-1 block min-w-56 rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"><option>All buildings</option>{buildings.map((building) => <option key={building.name}>{building.name}</option>)}</select></label>
          <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#376A34]">Generate report</button>
        </form>
      </Card>

      <Card>
        <PanelHeader title={`${applied.type.toUpperCase()} · ${applied.period.toUpperCase()}`} right={<span className="text-xs text-muted">{applied.scope}</span>} />
        <div className={`grid gap-3 px-5 py-4 ${applied.type === "Electricity Consumption" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
          <div className="rounded-lg border border-border bg-canvas p-3"><div className="text-xs text-muted">{totalLabel}</div><div className="mt-1 text-xl font-bold text-ink">{total.toLocaleString()} {unit}</div></div>
          {applied.type === "Electricity Consumption" && <div className="rounded-lg border border-border bg-canvas p-3"><div className="text-xs text-muted">Carbon emissions</div><div className="mt-1 text-xl font-bold text-ink">{exportSummary.carbonTotalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e</div><div className="text-xs text-muted">At {ELECTRICITY_EMISSIONS_KG_PER_KWH} kg CO₂e/kWh</div></div>}
          <div className="rounded-lg border border-border bg-canvas p-3"><div className="text-xs text-muted">{averageLabel}</div><div className="mt-1 text-xl font-bold text-ink">{average.toLocaleString()} {unit}</div></div>
          <div className="rounded-lg border border-border bg-canvas p-3"><div className="text-xs text-muted">{highestLabel}</div><div className="mt-1 truncate text-base font-bold text-ink">{topBuilding?.building || "No data"}</div><div className="text-xs text-muted">{topBuilding ? `${topBuilding.consumption.toLocaleString()} ${unit}` : ""}</div></div>
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full ${applied.type === "Electricity Consumption" ? "min-w-[760px]" : "min-w-[620px]"} text-sm`}>
            <thead><tr className="border-y border-border bg-canvas/60 text-left text-xs text-muted"><th className="px-5 py-3 font-medium">Building</th><th className="px-5 py-3 text-right font-medium">{applied.type === "Carbon Emissions" ? "Emissions" : "Consumption"}</th>{applied.type === "Electricity Consumption" && <th className="px-5 py-3 text-right font-medium">Carbon emissions</th>}<th className="px-5 py-3 font-medium">Status / tanks</th><th className="px-5 py-3 font-medium">Details</th></tr></thead>
            <tbody className="divide-y divide-border">{rows.map((row) => <tr key={row.building}><td className="px-5 py-3 font-medium text-ink">{row.building}</td><td className="px-5 py-3 text-right font-semibold tabular-nums text-ink">{row.consumption.toLocaleString(undefined, { maximumFractionDigits: 1 })} {row.unit}</td>{applied.type === "Electricity Consumption" && <td className="px-5 py-3 text-right tabular-nums text-ink">{row.emissionsKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e</td>}<td className="px-5 py-3 text-muted">{row.status}</td><td className="px-5 py-3 text-muted">{row.detail}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <span className="text-xs text-muted">{rows.length} records · sample data; period usage extrapolates daily readings</span>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            {exportMessage && <span role="status" className="w-full text-right text-xs font-medium text-ok sm:w-auto">{exportMessage}</span>}
            <button type="button" onClick={handleCsvExport} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-canvas"><Download size={15} /> Export CSV</button>
            <button type="button" onClick={handlePdfExport} disabled={isExportingPdf} className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-[#376A34] disabled:opacity-60"><FileDown size={15} /> {isExportingPdf ? "Preparing PDF" : "Export PDF"}</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
