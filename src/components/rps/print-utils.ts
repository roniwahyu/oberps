// Generates a clean, print-ready HTML document for RPS printing / PDF export

import {
  RpsData,
  parseCplProdi,
  parseCpmk,
  parseWeeklyMatrix,
  calculateBobot,
  parseNumberedList,
  parseRubrik,
} from "@/lib/rps-parser";

interface PrintParams {
  data: RpsData;
  mataKuliah: string;
  sks: string;
  semester: string;
  programStudi: string;
  deskripsi?: string;
}

function esc(s: string | undefined | null): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildPrintHtml(params: PrintParams): string {
  const { data, mataKuliah, sks, semester, programStudi, deskripsi } = params;
  const cplList = parseCplProdi(data.CPL_PRODI);
  const cpmkList = parseCpmk(data.CPMK);
  const matrix = parseWeeklyMatrix(data);
  const bobot = calculateBobot(data);
  const materiPokok = parseNumberedList(data.MATERI_POKOK);
  const refUtama = parseNumberedList(data.REFERENSI_UTAMA);
  const refPendukung = parseNumberedList(data.REFERENSI_PENDUKUNG);
  const rubrik = parseRubrik(data.RUBRIK_PENILAIAN);

  const cplHtml = cplList
    .map(
      (c) =>
        `<tr><td class="code">${esc(c.code)}</td><td class="label">${esc(c.label)}</td><td>${esc(c.description)}</td></tr>`
    )
    .join("");

  const cpmkHtml = cpmkList
    .map(
      (c) =>
        `<tr><td class="code">${esc(c.code)}</td><td>${esc(c.description)}</td></tr>`
    )
    .join("");

  const taksonomiHtml = (data.TAKSONOMI || [])
    .map(
      (t) =>
        `<tr><td class="code">${esc(t.TAK_KODE)}</td><td>${esc(t.TAK_CPMK)}</td><td>${esc(t.TAK_ASPEK)}</td><td class="code">${esc(t.TAK_LVL)}</td></tr>`
    )
    .join("");

  const matrixHtml = matrix
    .map((r) => {
      if (r.isEmpty) {
        return `<tr class="empty"><td class="code">M${r.week}</td><td colspan="8" class="muted">—</td></tr>`;
      }
      const rowClass = r.isUts ? "uts" : r.isUas ? "uas" : "";
      return `<tr class="${rowClass}">
        <td class="code">M${r.week}</td>
        <td>${esc(r.kemampuan) || "-"}</td>
        <td>${esc(r.materi) || "-"}</td>
        <td>${esc(r.indikator) || "-"}</td>
        <td class="num">${esc(r.bobot) || "-"}</td>
        <td>${esc(r.metode) || "-"}</td>
        <td>${esc(r.waktu) || "-"}</td>
        <td>${esc(r.media) || "-"}</td>
      </tr>`;
    })
    .join("");

  const materiHtml = materiPokok
    .map((m, i) => `<li>${esc(m)}</li>`)
    .join("");

  const refUtamaHtml = refUtama
    .map((r, i) => `<li>${esc(r)}</li>`)
    .join("");
  const refPendukungHtml = refPendukung
    .map((r, i) => `<li>${esc(r)}</li>`)
    .join("");

  const rubrikHtml = rubrik
    .map(
      (t) =>
        `<tr><td class="label">${esc(t.label)}</td><td class="code">${esc(t.range)}</td><td>${esc(t.description)}</td></tr>`
    )
    .join("");

  const bobotClass = bobot.isValid ? "valid" : "invalid";
  const bobotText = bobot.isValid
    ? `Total Bobot: ${bobot.total}% (Valid)`
    : `Total Bobot: ${bobot.total}% (Harus 100%)`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>RPS - ${esc(mataKuliah)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    color: #1a1a1a;
    margin: 0; padding: 0;
    font-size: 11px; line-height: 1.5;
  }
  .header {
    border-bottom: 3px solid #0f172a;
    padding-bottom: 12px; margin-bottom: 16px;
    display: flex; justify-content: space-between; align-items: flex-start;
    gap: 16px;
  }
  .header h1 { font-size: 18px; margin: 0 0 4px 0; color: #0f172a; }
  .header .meta { font-size: 10px; color: #555; }
  .header .badge {
    display: inline-block; padding: 2px 8px; border-radius: 4px;
    background: #0f172a; color: #fff; font-size: 9px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .info-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
    margin-bottom: 16px;
  }
  .info-box {
    border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px;
    background: #f8fafc;
  }
  .info-box .lbl {
    font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px;
    color: #64748b; font-weight: 600; margin-bottom: 2px;
  }
  .info-box .val { font-size: 11px; font-weight: 600; color: #0f172a; }
  h2 {
    font-size: 13px; color: #0f172a; margin: 20px 0 8px 0;
    padding-bottom: 4px; border-bottom: 1.5px solid #e2e8f0;
    display: flex; align-items: center; gap: 6px;
  }
  h2 .num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 18px; height: 18px; border-radius: 50%;
    background: #0f172a; color: #fff; font-size: 9px; font-weight: 700;
  }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  th {
    background: #0f172a; color: #fff; padding: 5px 6px;
    text-align: left; font-size: 9px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.3px;
  }
  td {
    padding: 5px 6px; border-bottom: 1px solid #e2e8f0;
    font-size: 10px; vertical-align: top;
  }
  td.code, th.code {
    font-family: "Courier New", monospace; font-weight: 600;
    white-space: nowrap; color: #0369a1;
  }
  td.label { font-weight: 600; color: #475569; white-space: nowrap; }
  td.num { text-align: center; font-weight: 600; }
  td.muted { color: #94a3b8; font-style: italic; text-align: center; }
  tr.empty td { color: #cbd5e1; }
  tr.uts { background: #fffbeb; }
  tr.uas { background: #fef2f2; }
  tr.uts td.code, tr.uas td.code { font-weight: 700; }
  ol { margin: 4px 0; padding-left: 20px; }
  ol li { margin-bottom: 3px; font-size: 10px; }
  .desc-box {
    background: #f8fafc; border-left: 3px solid #0f172a;
    padding: 8px 12px; margin: 8px 0; font-size: 10px; line-height: 1.6;
  }
  .bobot-badge {
    display: inline-block; padding: 3px 10px; border-radius: 4px;
    font-size: 10px; font-weight: 700; margin-left: 8px;
  }
  .bobot-badge.valid { background: #d1fae5; color: #065f46; }
  .bobot-badge.invalid { background: #fef3c7; color: #92400e; }
  .ref-section { margin-bottom: 6px; }
  .ref-section .ref-title {
    font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;
    color: #64748b; font-weight: 700; margin-bottom: 3px;
  }
  .footer {
    margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0;
    font-size: 8px; color: #94a3b8; text-align: center;
  }
  @media print {
    body { font-size: 10px; }
    h2 { page-break-after: avoid; }
    table { page-break-inside: avoid; }
    tr { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <!-- Official Institutional Kop Header -->
  <div style="border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 42px; height: 42px; border-radius: 8px; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; letter-spacing: -0.5px;">OBE</div>
      <div>
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a;">YAYASAN PENDIDIKAN PERGURUAN ISLAM WIDYA GAMA MALANG</div>
        <div style="font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase;">FAKULTAS TEKNIK &middot; ${esc(programStudi)}</div>
        <div style="font-size: 8px; color: #64748b;">Standar Penjaminan Mutu Internal (SPMI) SN-DIKTI &middot; Akreditasi LAM-INFOKOM</div>
      </div>
    </div>
    <div style="text-align: right;">
      <span class="badge" style="background:#0284c7; color:#fff; font-size:9px; padding:3px 8px; border-radius:4px;">STATUS: APPROVED SN-DIKTI</span>
      <div style="font-size: 8px; color: #64748b; margin-top: 4px;">Kode Dokumen: RPS-${esc(programStudi.replace(/\s+/g, '-').toUpperCase())}-2026</div>
    </div>
  </div>

  <div class="header">
    <div>
      <h1>RENCANA PEMBELAJARAN SEMESTER (RPS)</h1>
      <div class="meta">${esc(programStudi)} &middot; Semester ${esc(semester)} &middot; ${esc(sks)} SKS</div>
    </div>
    <span class="badge">OBE Standard</span>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <div class="lbl">Mata Kuliah</div>
      <div class="val">${esc(mataKuliah)}</div>
    </div>
    <div class="info-box">
      <div class="lbl">SKS</div>
      <div class="val">${esc(sks)}</div>
    </div>
    <div class="info-box">
      <div class="lbl">Semester</div>
      <div class="val">${esc(semester)}</div>
    </div>
    <div class="info-box">
      <div class="lbl">Program Studi</div>
      <div class="val">${esc(programStudi)}</div>
    </div>
  </div>

  ${(deskripsi || data.DESKRIPSI) ? `<div class="desc-box">${esc(deskripsi || data.DESKRIPSI)}</div>` : ""}

  <h2><span class="num">1</span> Deskripsi Mata Kuliah</h2>
  <div class="desc-box">${esc(data.DESKRIPSI || "-")}</div>

  ${data.MK_SYARAT && data.MK_SYARAT !== "-" ? `<p style="font-size:10px;"><strong>MK Syarat:</strong> ${esc(data.MK_SYARAT)}</p>` : ""}
  ${data.TEAM_TEACHING && data.TEAM_TEACHING !== "-" ? `<p style="font-size:10px;"><strong>Team Teaching:</strong> ${esc(data.TEAM_TEACHING)}</p>` : ""}

  <h2><span class="num">2</span> Capaian Pembelajaran Lulusan (CPL)</h2>
  <table>
    <thead><tr><th style="width:70px">Kode</th><th style="width:130px">Kategori</th><th>Deskripsi</th></tr></thead>
    <tbody>${cplHtml || '<tr><td colspan="3" class="muted">-</td></tr>'}</tbody>
  </table>

  <h2><span class="num">3</span> Capaian Pembelajaran Mata Kuliah (CPMK)</h2>
  <table>
    <thead><tr><th style="width:70px">Kode</th><th>Deskripsi</th></tr></thead>
    <tbody>${cpmkHtml || '<tr><td colspan="2" class="muted">-</td></tr>'}</tbody>
  </table>

  <h2><span class="num">4</span> Matriks Taksonomi Bloom</h2>
  <table>
    <thead><tr><th style="width:70px">CPL</th><th>CPMK</th><th style="width:120px">Aspek</th><th style="width:60px">Level</th></tr></thead>
    <tbody>${taksonomiHtml || '<tr><td colspan="4" class="muted">-</td></tr>'}</tbody>
  </table>

  <h2><span class="num">5</span> Rencana Pembelajaran Mingguan <span class="bobot-badge ${bobotClass}">${bobotText}</span></h2>
  <table>
    <thead>
      <tr>
        <th style="width:40px">Mgg</th>
        <th>Sub-CPMK</th>
        <th>Materi</th>
        <th>Indikator</th>
        <th style="width:45px">Bobot</th>
        <th style="width:90px">Metode</th>
        <th style="width:70px">Waktu</th>
        <th style="width:90px">Media</th>
      </tr>
    </thead>
    <tbody>${matrixHtml}</tbody>
  </table>

  ${materiPokok.length > 0 ? `
  <h2><span class="num">6</span> Materi Pokok</h2>
  <ol>${materiHtml}</ol>` : ""}

  ${(refUtama.length > 0 || refPendukung.length > 0) ? `
  <h2><span class="num">7</span> Referensi</h2>
  <div class="ref-section">
    <div class="ref-title">Referensi Utama</div>
    <ol>${refUtamaHtml || '<li>-</li>'}</ol>
  </div>
  ${refPendukung.length > 0 ? `
  <div class="ref-section">
    <div class="ref-title">Referensi Pendukung</div>
    <ol>${refPendukungHtml}</ol>
  </div>` : ""}` : ""}

  ${data.INTEGRASI_RISPKM ? `
  <h2><span class="num">8</span> Integrasi RISPKM</h2>
  <div class="desc-box">${esc(data.INTEGRASI_RISPKM)}</div>` : ""}

  ${(data.MEDIA_LUNAK || data.MEDIA_KERAS) ? `
  <h2><span class="num">9</span> Media Pembelajaran</h2>
  <table>
    <tbody>
      ${data.MEDIA_LUNAK ? `<tr><td class="label" style="width:120px">Media Lunak</td><td>${esc(data.MEDIA_LUNAK)}</td></tr>` : ""}
      ${data.MEDIA_KERAS ? `<tr><td class="label" style="width:120px">Media Keras</td><td>${esc(data.MEDIA_KERAS)}</td></tr>` : ""}
    </tbody>
  </table>` : ""}

  ${data.RANCANGAN_TUGAS ? `
  <h2><span class="num">10</span> Rancangan Tugas</h2>
  <div class="desc-box" style="white-space:pre-wrap">${esc(data.RANCANGAN_TUGAS)}</div>` : ""}

  ${rubrik.length > 0 ? `
  <h2><span class="num">11</span> Rubrik Penilaian</h2>
  <table>
    <thead><tr><th style="width:130px">Kategori</th><th style="width:90px">Rentang</th><th>Deskripsi</th></tr></thead>
    <tbody>${rubrikHtml}</tbody>
  </table>` : ""}

  <!-- Validation & Signatures Block -->
  <div style="margin-top: 30px; page-break-inside: avoid;">
    <table style="width: 100%; border: 1px solid #cbd5e1; border-collapse: collapse; margin-top: 16px;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 33%;">Dosen Pengampu</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 33%;">Pemeriksa (GPM / LPM)</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 34%;">Persetujuan (Ketua Program Studi)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 30px 12px 12px 12px; text-align: center; font-size: 10px;">
            <div style="font-weight: 700;">${esc(data.TEAM_TEACHING && data.TEAM_TEACHING !== "-" ? data.TEAM_TEACHING : "Tim Dosen Pengampu")}</div>
            <div style="color: #64748b; font-size: 9px; margin-top: 2px;">Penyusun RPS</div>
          </td>
          <td style="border: 1px solid #cbd5e1; padding: 30px 12px 12px 12px; text-align: center; font-size: 10px;">
            <div style="font-weight: 700;">Gugus Penjaminan Mutu</div>
            <div style="color: #64748b; font-size: 9px; margin-top: 2px;">Reviewer Kurikulum OBE</div>
          </td>
          <td style="border: 1px solid #cbd5e1; padding: 30px 12px 12px 12px; text-align: center; font-size: 10px;">
            <div style="font-weight: 700;">Ketua Program Studi ${esc(programStudi)}</div>
            <div style="color: #64748b; font-size: 9px; margin-top: 2px;">Mengesahkan</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer" style="margin-top: 20px; font-size: 9px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
    <div>Dokumen RPS Resmi &middot; ${esc(mataKuliah)} (${esc(programStudi)}) &middot; SN-DIKTI Verified</div>
    <div style="font-family: monospace; font-weight: 600; color: #0284c7;">VERIFIED BY SPMI &middot; DICETAK MELALUI OBERPS SYSTEM</div>
  </div>
</body>
</html>`;
}
