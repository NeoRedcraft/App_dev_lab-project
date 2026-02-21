import "./ReportSummary.css";
import { supabase } from "../../database/client";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

type BookRow = {
  id: number;
  Title: string | null;
  Author: string | null;
  Publisher: string | null;
  Year: string | null; 
  Edition: string | null;
  Course_code: string | null;
  Created_at: string | null; 
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const pad2 = (n: number) => String(n).padStart(2, "0");

const ReportSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(""); 
  const [selectedMonth, setSelectedMonth] = useState<string>(""); 
  const [searchTerm, setSearchTerm] = useState("");

  const [books, setBooks] = useState<BookRow[]>([]);
  const printRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  useEffect(() => {
    const loadYears = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("books").select("Created_at");
        if (error) throw error;

        const ySet = new Set<number>();
        (data ?? []).forEach((r: any) => {
          if (!r?.Created_at) return;
          const d = new Date(r.Created_at);
          if (Number.isNaN(d.getTime())) return;
          ySet.add(d.getFullYear());
        });

        const years = Array.from(ySet).sort((a, b) => b - a);
        setAvailableYears(years);
      } catch (e: any) {
        console.log("Error loading years:", e?.message || e);
        setAvailableYears([]);
      } finally {
        setLoading(false);
      }
    };

    loadYears();
  }, []);

  useEffect(() => {
    const loadBooks = async () => {
      if (!selectedYear) {
        setBooks([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("books")
          .select("id, Title, Author, Course_code, Publisher, Year, Edition, Created_at")
          .order("id", { ascending: true });

        if (error) throw error;

        const y = parseInt(selectedYear, 10);
        const m = selectedMonth ? parseInt(selectedMonth, 10) : null;
        const filtered = (data ?? []).filter((row: any) => {
          const ca = row?.Created_at;
          if (!ca) return false;
          const d = new Date(ca);
          if (Number.isNaN(d.getTime())) return false;

          const sameYear = d.getFullYear() === y;
          if (!sameYear) return false;

          if (m) {
            return d.getMonth() + 1 === m;
          }
          return true;
        }) as BookRow[];

        setBooks(filtered);
      } catch (e: any) {
        console.log("Error loading books:", e?.message || e);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [selectedYear, selectedMonth]);

  const shownBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return books;

    return books.filter((b) => {
      const t = (b.Title ?? "").toLowerCase();
      const a = (b.Author ?? "").toLowerCase();
      const cc = (b.Course_code ?? "").toLowerCase();
      const p = (b.Publisher ?? "").toLowerCase();
      return t.includes(q) || a.includes(q) || cc.includes(q) || p.includes(q);
    });
  }, [books, searchTerm]);

  const handleSaveExcel = () => {
    const headers = ["ID", "Title", "Author", "Course Code", "Publisher", "Year", "Accession number", "Edition"];
    const rows = shownBooks.map((b) => [
      b.id,
      b.Title ?? "",
      b.Author ?? "",
      b.Course_code ?? "",
      b.Publisher ?? "",
      b.Year ?? "",
      b.Course_code ?? "", 
      b.Edition ?? "",
    ]);

    const escapeCSV = (v: any) => {
      const s = String(v ?? "");
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const csv = [headers, ...rows].map((r) => r.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const yearPart = selectedYear || "all";
    const monthPart = selectedMonth ? `-${selectedMonth}` : "";
    const fileName = `report-summary-${yearPart}${monthPart}.csv`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSavePDF = () => {
    window.print();
  };

  const monthLabel = selectedMonth ? monthNames[parseInt(selectedMonth, 10) - 1] : "All Months";

  return (
    <div className="pc-page">
      <header className="pc-topbar">
        <img className="pc-toplogo" src="/images/logo2.webp" alt="MAPUA LIBRARY" />
      </header>

      <div className="pc-body">
        <aside className="pc-sidebar">
          <nav className="pc-nav">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>

            <NavLink to="/program-course" className={({ isActive }) => (isActive ? "active" : "")}>
              Program &amp; <br />
              Course view
            </NavLink>

            <NavLink to="/editions" className={({ isActive }) => (isActive ? "active" : "")}>
              Editions
            </NavLink>

            <NavLink to="/report-summary" className={({ isActive }) => (isActive ? "active" : "")}>
              Report <br />
              Summary
            </NavLink>
          </nav>

          <button className="pc-signout" onClick={handleLogout}>
            ↩ Sign Out
          </button>
        </aside>

        <main className="pc-main">
          <div className="pc-main-head">
            <h1 className="pc-title">Report Summary</h1>

            <div className="pc-head-right">
              <div className="pc-search">
                <input
                  type="text"
                  placeholder="Search Book"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="pc-search-ic">🔍</span>
              </div>

              <button
                type="button"
                className="pc-logbtn"
                onClick={() =>
                  navigate("/books-encoding", {
                    state: { openModal: true, from: location.pathname },
                  })
                }
              >
                Log Books
              </button>
            </div>
          </div>

          <section className="rs-box" ref={printRef}>
            <div className="rs-top">
              <div className="rs-tabs">
                <select
                  className="rs-pill"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedMonth("");
                  }}
                >
                  <option value="">Select Year (required)</option>
                  {availableYears.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>

                <select
                  className="rs-pill"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={!selectedYear}
                >
                  <option value="">{selectedYear ? "All Months (optional)" : "Select Year first"}</option>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const mm = pad2(i + 1);
                    return (
                      <option key={mm} value={mm}>
                        {monthNames[i]}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="rs-actions">
                <button
                  type="button"
                  className="rs-pill rs-small"
                  onClick={handleSavePDF}
                  disabled={!selectedYear || shownBooks.length === 0}
                  title={!selectedYear ? "Select a year first" : shownBooks.length === 0 ? "No data to print" : ""}
                >
                  Save PDF
                </button>
                <button
                  type="button"
                  className="rs-pill rs-small"
                  onClick={handleSaveExcel}
                  disabled={!selectedYear || shownBooks.length === 0}
                  title={!selectedYear ? "Select a year first" : shownBooks.length === 0 ? "No data to export" : ""}
                >
                  Save Excel
                </button>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
              {selectedYear ? (
                <>
                  Showing acquired books for <b>{selectedYear}</b> • <b>{monthLabel}</b> • Total:{" "}
                  <b>{shownBooks.length}</b>
                </>
              ) : (
                "Select a Year to display acquired books."
              )}
            </div>

            <div className="rs-tableWrap">
              <table className="rs-table">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>ID</th>
                    <th>Title</th>
                    <th style={{ width: 140 }}>Author</th>
                    <th style={{ width: 120 }}>Course Code</th>
                    <th style={{ width: 140 }}>Publisher</th>
                    <th style={{ width: 70 }}>Year</th>
                    <th style={{ width: 140 }}>Course Code</th>
                    <th style={{ width: 90 }}>Edition</th>
                  </tr>
                </thead>

                <tbody>
                  {!selectedYear ? (
                    <tr>
                      <td colSpan={8} style={{ padding: 16, color: "#666" }}>
                        Please select a Year first.
                      </td>
                    </tr>
                  ) : loading ? (
                    <tr>
                      <td colSpan={8} style={{ padding: 16 }}>
                        Loading...
                      </td>
                    </tr>
                  ) : shownBooks.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: 16 }}>
                        No acquired books found for this filter.
                      </td>
                    </tr>
                  ) : (
                    shownBooks.map((b) => (
                      <tr key={b.id}>
                        <td>{b.id}</td>
                        <td>{b.Title}</td>
                        <td>{b.Author}</td>
                        <td>{b.Course_code}</td>
                        <td>{b.Publisher}</td>
                        <td>{b.Year}</td>
                        <td>{b.Course_code}</td>
                        <td>{b.Edition}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ReportSummary;