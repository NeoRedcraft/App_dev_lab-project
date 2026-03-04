import "./Edition.css";
import { supabase } from "../../database/client";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

type ViewRow = {
  department: string | null;
  program: string | null;
  course_code: string | null;
  course_title: string | null;

  book_id: number;
  title: string | null;
  author: string | null;
  copyright_year: number | null;
};

const OUTDATED_YEARS = 5;

const Editions = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [courseCodes, setCourseCodes] = useState<string[]>([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCourseCode, setSelectedCourseCode] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState<ViewRow[]>([]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  const getStatus = (yearNum: number | null) => {
    if (!yearNum || !Number.isFinite(yearNum)) return "—";
    const currentYear = new Date().getFullYear();
    const age = currentYear - yearNum;

    return age >= OUTDATED_YEARS ? "OUTDATED" : "LATEST EDITION";
  };

  useEffect(() => {
    const loadDepartments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("library_courses").select("department");
        if (error) throw error;

        const set = new Set<string>();
        (data ?? []).forEach((row: any) => {
          const d = (row?.department ?? "").toString().trim();
          if (d) set.add(d);
        });

        setDepartments(Array.from(set).sort());
      } catch (e: any) {
        console.log("Error loading departments:", e?.message || e);
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

  useEffect(() => {
    const loadPrograms = async () => {
      if (!selectedDepartment) {
        setPrograms([]);
        setSelectedProgram("");
        setSelectedCourseCode("");
        setCourseCodes([]);
        setBooks([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("library_courses")
          .select("program")
          .eq("department", selectedDepartment);

        if (error) throw error;

        const set = new Set<string>();
        (data ?? []).forEach((row: any) => {
          const p = (row?.program ?? "").toString().trim();
          if (p) set.add(p);
        });

        setPrograms(Array.from(set).sort());
      } catch (e: any) {
        console.log("Error loading programs:", e?.message || e);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [selectedDepartment]);

  useEffect(() => {
    const loadCourseCodes = async () => {
      if (!selectedDepartment || !selectedProgram) {
        setCourseCodes([]);
        setSelectedCourseCode("");
        setBooks([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("library_courses")
          .select("course_code")
          .eq("department", selectedDepartment)
          .eq("program", selectedProgram);

        if (error) throw error;

        const set = new Set<string>();
        (data ?? []).forEach((row: any) => {
          const c = (row?.course_code ?? "").toString().trim();
          if (c) set.add(c);
        });

        setCourseCodes(Array.from(set).sort());
      } catch (e: any) {
        console.log("Error loading course codes:", e?.message || e);
        setCourseCodes([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourseCodes();
  }, [selectedDepartment, selectedProgram]);

  useEffect(() => {
    const loadBooks = async () => {
      if (!selectedDepartment || !selectedProgram || !selectedCourseCode) {
        setBooks([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("v_course_books")
          .select("book_id, title, author, copyright_year, department, program, course_code")
          .eq("department", selectedDepartment)
          .eq("program", selectedProgram)
          .eq("course_code", selectedCourseCode)
          .order("book_id", { ascending: true });

        if (error) throw error;

        setBooks((data ?? []) as ViewRow[]);
      } catch (e: any) {
        console.log("Error loading books:", e?.message || e);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [selectedDepartment, selectedProgram, selectedCourseCode]);

  const filteredBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return books;

    return books.filter((b) => {
      const t = (b.title ?? "").toLowerCase();
      const a = (b.author ?? "").toLowerCase();
      return t.includes(q) || a.includes(q);
    });
  }, [books, searchTerm]);

  const showCourseHint = !selectedDepartment || !selectedProgram;
  const showNoCodes = selectedDepartment && selectedProgram && !loading && courseCodes.length === 0;
  const showTableHint = !selectedDepartment || !selectedProgram || !selectedCourseCode;

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
            <h1 className="pc-title">Editions</h1>

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

          <section className="pc-grid">
            {/* LEFT FILTERS */}
            <div className="pc-leftCard">
              <label className="pc-label">Department</label>
              <div className="pc-selectWrap">
                <select
                  className="pc-select"
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedProgram("");
                    setSelectedCourseCode("");
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <span className="pc-caret">⌄</span>
              </div>

              <label className="pc-label">Program</label>
              <div className="pc-selectWrap">
                <select
                  className="pc-select"
                  value={selectedProgram}
                  onChange={(e) => {
                    setSelectedProgram(e.target.value);
                    setSelectedCourseCode("");
                  }}
                  disabled={!selectedDepartment}
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <span className="pc-caret">⌄</span>
              </div>

              <div className="pc-bigBox">
                {showCourseHint ? (
                  <div className="pc-boxMsg pc-boxHint">Select Department and Program first.</div>
                ) : loading ? (
                  <div className="pc-boxMsg pc-boxLoading">Loading...</div>
                ) : showNoCodes ? (
                  <div className="pc-boxMsg pc-boxEmpty">No course codes found.</div>
                ) : (
                  <ul className="pc-codeList">
                    {courseCodes.map((code) => {
                      const active = code === selectedCourseCode;
                      return (
                        <li
                          key={code}
                          className={`pc-codeItem ${active ? "active" : ""}`}
                          onClick={() => setSelectedCourseCode(code)}
                        >
                          {code}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* RIGHT TABLE */}
            <div className="pc-rightCard">
              <div className="pc-tableTop">
                <div className="pc-tableTitle">
                  ({selectedCourseCode || "Course Code"}) Library
                </div>

                <button className="pc-sort" type="button" disabled>
                  SORT <span className="pc-sort-ic">⇅</span>
                </button>
              </div>

              <div className="pc-tableWrap">
                <table className="pc-table pc-edTable">
                  <thead>
                    <tr>
                      <th className="pc-col-id pc-center">ID</th>
                      <th className="pc-col-title">Title</th>
                      <th className="pc-col-author">Author</th>
                      <th className="pc-col-year pc-center">Year</th>
                      <th className="pc-col-status pc-center">Status</th>
                      <th className="pc-col-edit pc-center"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {showTableHint ? (
                      <tr>
                        <td colSpan={6} className="pc-rowMsg">
                          Select Department → Program → Course Code to view books.
                        </td>
                      </tr>
                    ) : loading ? (
                      <tr>
                        <td colSpan={6} className="pc-rowMsg">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredBooks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="pc-rowMsg">
                          No books found for this course code.
                        </td>
                      </tr>
                    ) : (
                      filteredBooks.map((b, index) => (
                        <tr key={b.book_id}>
                          <td className="pc-center">{index + 1}</td>
                          <td>{b.title}</td>
                          <td>{b.author}</td>
                          <td className="pc-center">{b.copyright_year ?? ""}</td>
                          <td className="pc-center">{getStatus(b.copyright_year)}</td>
                          <td className="pc-center">
                             <button
                                type="button"
                                onClick={() => navigate(`/editing/${b.book_id}`, { state: { from: location.pathname } })}
                              >
                                Edit
                              </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pc-footnote">
                Status rule: Outdated if book is {OUTDATED_YEARS}+ years old.
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Editions;