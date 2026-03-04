export type PrintRow = {
  book_id: number;
  acc_no: string | null;
  call_no: string | null;
  title: string | null;
  author: string | null;
  publisher: string | null;
  copyright_year: number | null;
  num_vols: number | null;
};

const escapeHtml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function buildCoursePrintHtml(header: string, rows: PrintRow[]) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(header)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    .title { text-align:center; font-weight:700; font-size:18px; margin-bottom:12px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; vertical-align: top; word-wrap: break-word; }
    th { text-align: center; font-weight: 700; }
    .col-sn { width: 70px; text-align: center; }
    .col-author { width: 170px; }
    .col-title { width: 260px; }
    .col-publisher { width: 150px; }
    .col-year { width: 70px; text-align: center; }
    .col-call { width: 120px; text-align: center; }
    .col-vols { width: 90px; text-align: center; }
    @media print { body { padding: 0; } .title { margin-top: 0; } }
  </style>
</head>
<body>
  <div class="title">${escapeHtml(header)}</div>

  <table>
    <thead>
      <tr>
        <th class="col-sn">SN</th>
        <th class="col-author">AUTHOR</th>
        <th class="col-title">TITLE</th>
        <th class="col-publisher">PUBLISHER</th>
        <th class="col-year">YEAR</th>
        <th class="col-call">CALL NUMBER</th>
        <th class="col-vols">NO. OF VOLS</th>
      </tr>
    </thead>
    <tbody>
      ${
        rows.length === 0
          ? `<tr><td colspan="8" style="text-align:center;padding:14px;">No records.</td></tr>`
          : rows
              .map((b) => {
                const sn = (b.acc_no ?? b.book_id.toString()) || "";
                const author = b.author ?? "";
                const title = b.title ?? "";
                const publisher = b.publisher ?? "";
                const year = b.copyright_year?.toString() ?? "";
                const call = b.call_no ?? "";
                const vols = b.num_vols?.toString() ?? "";
                const acc = b.acc_no ?? "";

                return `
                  <tr>
                    <td class="col-sn">${escapeHtml(sn)}</td>
                    <td class="col-author">${escapeHtml(author)}</td>
                    <td class="col-title">${escapeHtml(title)}</td>
                    <td class="col-publisher">${escapeHtml(publisher)}</td>
                    <td class="col-year">${escapeHtml(year)}</td>
                    <td class="col-call">${escapeHtml(call)}</td>
                    <td class="col-vols">${escapeHtml(vols)}</td>
                  </tr>
                `;
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