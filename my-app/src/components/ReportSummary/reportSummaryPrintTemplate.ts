export type SummaryRow = {
  course_code: string;
  course_title: string;

  total_titles: number;
  total_vols: number;

  arc: number;
  perYear: Record<number, number>;

  withinLast5: number;
  neededTitles: number;
};

const escapeHtml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function buildReportSummaryPrintHtml(args: {
  department: string;
  program: string;
  yearCols: number[];
  summary: SummaryRow[];
}) {
  const { department, program, yearCols, summary } = args;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Report Summary</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 18px; color: #111; }
    .header { margin-bottom: 10px; }
    .header .dept { font-weight: 700; text-transform: uppercase; }

    table { width: 100%; border-collapse: collapse; table-layout: fixed; }

    /* sizing: feel free to adjust */
    th:nth-child(1), td:nth-child(1) { width: 110px; }   /* COURSE CODE */
    th:nth-child(2), td:nth-child(2) { width: 360px; }   /* COURSE TITLE bigger */
    th:nth-child(3), td:nth-child(3) { width: 110px; }   /* TOTAL TITLES */
    th:nth-child(4), td:nth-child(4) { width: 110px; }   /* TOTAL VOLS */
    th:nth-child(5), td:nth-child(5) { width: 70px; }    /* ARC */

    th, td { border: 1px solid #000; padding: 6px 8px; font-size: 11px; }
    th { text-align: center; font-weight: 700; }
    td { text-align: center; }

    /* Excel-ish look */
    .th-red { background: #b40000; color: #fff; }
    .th-yellow { background: #ffe04d; }
    .left { text-align: left; }

    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="dept">${escapeHtml(department)} — ${escapeHtml(program)}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="th-red">COURSE CODE</th>
        <th class="th-red">COURSE TITLE</th>
        <th class="th-red">TOTAL NO. OF TITLES</th>
        <th class="th-red">TOTAL NO. OF VOLUMES</th>
        <th class="th-red">ARC</th>
        ${yearCols.map((y) => `<th class="th-yellow">${y}</th>`).join("")}
        <th class="th-red">COPYRIGHT WITHIN THE LAST 5 YEARS</th>
        <th class="th-red">NEEDED TITLES</th>
      </tr>
    </thead>

    <tbody>
      ${
        summary.length === 0
          ? `<tr><td colspan="${5 + yearCols.length + 2}" style="text-align:center;padding:14px;">No data.</td></tr>`
          : summary
              .map((r) => {
                const yearCells = yearCols.map((y) => `<td>${r.perYear[y] ?? 0}</td>`).join("");

                return `
<tr>
  <td class="left">${escapeHtml(r.course_code)}</td>
  <td class="left">${escapeHtml(r.course_title || "")}</td>
  <td>${r.total_titles}</td>
  <td>${r.total_vols}</td>
  <td>${r.arc}</td>
  ${yearCells}
  <td>${r.withinLast5}</td>
  <td>${r.neededTitles}</td>
</tr>`;
              })
              .join("")
      }
    </tbody>
  </table>

  <script>
    window.onload = () => { window.focus(); window.print(); };
  </script>
</body>
</html>`;
}