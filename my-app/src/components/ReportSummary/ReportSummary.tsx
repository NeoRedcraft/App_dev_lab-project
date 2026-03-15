import "./ReportSummary.css";
import { supabase } from "../../database/client";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { buildReportSummaryPrintHtml, type SummaryRow as PrintSummaryRow } from "./reportSummaryPrintTemplate";

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

type ViewRow = {
  department: string | null;
  program: string | null;
  course_code: string | null;
  course_title: string | null;

  book_id: number;
  copyright_year: number | null;
  num_vols: number | null;
};

type SummaryRow = {
  course_code: string;
  course_title: string;

  total_titles: number;
  total_vols: number;

  arc: number;
  perYear: Record<number, number>;

  withinLast5: number;
  neededTitles: number;
};

const REQUIRED_RECENT_TITLES = 5;

function uniqSorted(values: Array<string | null | undefined>) {
  const set = new Set<string>();
  for (const v of values) {
    const s = (v ?? "").toString().trim();
    if (s) set.add(s);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

const ReportSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<ViewRow[]>([]);

  const currentYear = new Date().getFullYear();

  const yearCols = useMemo(() => {
    const cols: number[] = [];
    for (let i = 5; i >= 0; i--) cols.push(currentYear - i);
    return cols;
  }, [currentYear]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  const resetProgramLevel = () => {
    setPrograms([]);
    setSelectedProgram("");
    setRows([]);
  };

  const resetRows = () => {
    setRows([]);
  };

  const loadDepartments = async (cancelledRef: { cancelled: boolean }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("library_courses").select("department");
      if (error) throw error;
      if (cancelledRef.cancelled) return;

      setDepartments(uniqSorted((data ?? []).map((r) => r.department)));
    } catch (e: any) {
      console.log("Error loading departments:", e?.message || e);
      if (!cancelledRef.cancelled) setDepartments([]);
    } finally {
      if (!cancelledRef.cancelled) setLoading(false);
    }
  };

  const loadPrograms = async (dept: string, cancelledRef: { cancelled: boolean }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("library_courses")
        .select("program")
        .eq("department", dept);

      if (error) throw error;
      if (cancelledRef.cancelled) return;

      setPrograms(uniqSorted((data ?? []).map((r) => r.program)));
    } catch (e: any) {
      console.log("Error loading programs:", e?.message || e);
      if (!cancelledRef.cancelled) setPrograms([]);
    } finally {
      if (!cancelledRef.cancelled) setLoading(false);
    }
  };

  const loadSummaryRows = async (dept: string, prog: string, cancelledRef: { cancelled: boolean }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("v_course_books")
        .select("department, program, course_code, course_title, book_id, copyright_year, num_vols")
        .eq("department", dept)
        .eq("program", prog)
        .order("course_code", { ascending: true });

      if (error) throw error;
      if (cancelledRef.cancelled) return;

      setRows((data ?? []) as ViewRow[]);
    } catch (e: any) {
      console.log("Error loading report rows:", e?.message || e);
      if (!cancelledRef.cancelled) setRows([]);
    } finally {
      if (!cancelledRef.cancelled) setLoading(false);
    }
  };

  useEffect(() => {
    const cancelledRef = { cancelled: false };
    loadDepartments(cancelledRef);
    return () => {
      cancelledRef.cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cancelledRef = { cancelled: false };

    if (!selectedDepartment) {
      resetProgramLevel();
      return () => {
        cancelledRef.cancelled = true;
      };
    }

    setSelectedProgram("");
    setRows([]);

    loadPrograms(selectedDepartment, cancelledRef);

    return () => {
      cancelledRef.cancelled = true;
    };
  }, [selectedDepartment]);

  useEffect(() => {
    const cancelledRef = { cancelled: false };

    if (!selectedDepartment || !selectedProgram) {
      resetRows();
      return () => {
        cancelledRef.cancelled = true;
      };
    }

    loadSummaryRows(selectedDepartment, selectedProgram, cancelledRef);

    return () => {
      cancelledRef.cancelled = true;
    };
  }, [selectedDepartment, selectedProgram]);

  const summary: SummaryRow[] = useMemo(() => {
    const minYear = currentYear - 5;
    const yearSet = new Set<number>(yearCols);

    const byCourse = new Map<string, SummaryRow>();

    // Make counts “distinct by title” to avoid double-counting if the view duplicates rows.
    // key = `${course_code}|${book_id}`
    const seenTitle = new Set<string>();
    const seenYearTitle = new Set<string>(); 
    const seenArcTitle = new Set<string>();  

    for (const r of rows) {
      const cc = (r.course_code ?? "General").toString();
      const ct = (r.course_title ?? "").toString();

      if (!byCourse.has(cc)) {
        byCourse.set(cc, {
          course_code: cc,
          course_title: ct,
          total_titles: 0,
          total_vols: 0,
          arc: 0,
          perYear: {},
          withinLast5: 0,
          neededTitles: 0,
        });
      }

      const item = byCourse.get(cc)!;

      const titleKey = `${cc}|${r.book_id}`;
      if (!seenTitle.has(titleKey)) {
        seenTitle.add(titleKey);
        item.total_titles += 1;

        const vols = typeof r.num_vols === "number" ? r.num_vols : 0;
        item.total_vols += vols;
      }

      const y = r.copyright_year;
      if (!y || typeof y !== "number") continue;

      if (y < minYear) {
        const arcKey = `${cc}|${r.book_id}|arc`;
        if (!seenArcTitle.has(arcKey)) {
          seenArcTitle.add(arcKey);
          item.arc += 1;
        }
      } else if (yearSet.has(y)) {
        const yKey = `${cc}|${r.book_id}|${y}`;
        if (!seenYearTitle.has(yKey)) {
          seenYearTitle.add(yKey);
          item.perYear[y] = (item.perYear[y] ?? 0) + 1;
        }
      }
    }

    const list = Array.from(byCourse.values()).map((x) => {
      let within = 0;
      for (let i = 0; i <= 4; i++) {
        within += x.perYear[currentYear - i] ?? 0;
      }
      x.withinLast5 = within;
      x.neededTitles = Math.max(0, REQUIRED_RECENT_TITLES - within);
      return x;
    });

    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;

    return list.filter((r) => {
      return (
        r.course_code.toLowerCase().includes(q) ||
        (r.course_title ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, yearCols, currentYear, searchTerm]);

  const printReport = () => {
    if (!selectedDepartment || !selectedProgram) return;

    const html = buildReportSummaryPrintHtml({
      department: selectedDepartment,
      program: selectedProgram,
      yearCols,
      summary: summary as PrintSummaryRow[],
    });

    const w = window.open("", "_blank", "width=1200,height=800");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

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
                <span className="pc-search-ic"><IconSearch /></span>
                <input
                  type="text"
                  placeholder="Search course code or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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

          <section className="rs-box">
            <div className="rs-top">
              <div className="rs-filters">
                <div className="rs-selectWrap">
                  <select
                    className="rs-select"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <option value="">Department</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <span className="rs-caret">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
                </div>

                <div className="rs-selectWrap">
                  <select
                    className="rs-select"
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    disabled={!selectedDepartment}
                  >
                    <option value="">{selectedDepartment ? "Program" : "Select Department"}</option>
                    {programs.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <span className="rs-caret">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
                </div>
              </div>

              <button
                type="button"
                className="rs-printBtn"
                onClick={printReport}
                disabled={!selectedDepartment || !selectedProgram || summary.length === 0}
                title={
                  !selectedDepartment || !selectedProgram
                    ? "Select Department & Program"
                    : summary.length === 0
                    ? "No data to print"
                    : ""
                }
              >
                Print
              </button>
            </div>

            <div className="rs-tableWrap">
              <table className="rs-table">
                <thead>
                  <tr>
                    <th className="rs-col-code">Course Code</th>
                    <th className="rs-col-title">Course Code title</th>
                    <th className="rs-col-ttl">Total Num of Titles</th>
                    <th className="rs-col-vol">Total Num of Volume</th>
                    <th className="rs-col-arc">Arc</th>

                    {yearCols.map((y) => (
                      <th key={y} className="rs-col-year">
                        {y}
                      </th>
                    ))}

                    <th className="rs-col-within">COPYRIGHT WITHIN THE LAST 5 YEARS</th>
                    <th className="rs-col-needed">Needed titles</th>
                  </tr>
                </thead>

                <tbody>
                  {!selectedDepartment || !selectedProgram ? (
                    <tr>
                      <td colSpan={5 + yearCols.length + 2} className="rs-rowMsg">
                        Select Department and Program.
                      </td>
                    </tr>
                  ) : loading ? (
                    <tr>
                      <td colSpan={5 + yearCols.length + 2} className="rs-rowMsg">
                        Loading...
                      </td>
                    </tr>
                  ) : summary.length === 0 ? (
                    <tr>
                      <td colSpan={5 + yearCols.length + 2} className="rs-rowMsg">
                        No data found.
                      </td>
                    </tr>
                  ) : (
                    summary.map((r) => (
                      <tr key={r.course_code}>
                        <td className="rs-left">{r.course_code}</td>
                        <td className="rs-left">{r.course_title}</td>
                        <td>{r.total_titles}</td>
                        <td>{r.total_vols}</td>
                        <td>{r.arc}</td>

                        {yearCols.map((y) => (
                          <td key={y}>{r.perYear[y] ?? 0}</td>
                        ))}

                        <td>{r.withinLast5}</td>
                        <td>{r.neededTitles}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="rs-footnote">
              Showing publish year (copyright_year). Columns include current year + past 5 years; older titles go to ARC.
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ReportSummary;