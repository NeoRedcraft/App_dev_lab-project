import "./ProgramCourse.css";
import { supabase } from "../../database/client";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { buildCoursePrintHtml } from "./coursePrintTemplate";

export type ViewRow = {
  department: string | null;
  program: string | null;
  course_code: string | null;
  course_title: string | null;

  book_id: number;
  acc_no: string | null;
  call_no: string | null;
  title: string | null;
  author: string | null;
  publisher: string | null;
  copyright_year: number | null;
  num_vols: number | null;
  apa_citation: string | null;
};

function uniqSorted(values: Array<string | null | undefined>) {
  const set = new Set<string>();
  for (const v of values) {
    const s = (v ?? "").toString().trim();
    if (s) set.add(s);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function SelectField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
  placeholder: string;
}) {
  return (
    <>
      <label className="pc-label">{props.label}</label>
      <div className="pc-selectWrap">
        <select
          className="pc-select"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          disabled={props.disabled}
        >
          <option value="">{props.placeholder}</option>
          {props.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="pc-caret">⌄</span>
      </div>
    </>
  );
}

const ProgramCourse = () => {
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

  const courseTitle = useMemo(() => {
    return (books?.[0]?.course_title ?? "").toString().trim();
  }, [books]);

  const resetBooksLevel = () => {
    setBooks([]);
    setSearchTerm("");
  };

  const resetCourseLevel = () => {
    setCourseCodes([]);
    setSelectedCourseCode("");
    resetBooksLevel();
  };

  const resetProgramLevel = () => {
    setPrograms([]);
    setSelectedProgram("");
    resetCourseLevel();
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };

  const loadDepartments = async (cancelledRef: { cancelled: boolean }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("library_courses").select("department");
      if (error) throw error;
      if (cancelledRef.cancelled) return;

      setDepartments(uniqSorted((data ?? []).map((r: any) => r?.department)));
    } catch (e: any) {
      console.log("Error loading departments:", e?.message || e);
    } finally {
      if (!cancelledRef.cancelled) setLoading(false);
    }
  };

  const loadPrograms = async (department: string, cancelledRef: { cancelled: boolean }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("library_courses")
        .select("program")
        .eq("department", department);

      if (error) throw error;
      if (cancelledRef.cancelled) return;

      setPrograms(uniqSorted((data ?? []).map((r: any) => r?.program)));
    } catch (e: any) {
      console.log("Error loading programs:", e?.message || e);
      if (!cancelledRef.cancelled) setPrograms([]);
    } finally {
      if (!cancelledRef.cancelled) setLoading(false);
    }
  };

  const loadCourseCodes = async (
    department: string,
    program: string,
    cancelledRef: { cancelled: boolean }
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("library_courses")
        .select("course_code")
        .eq("department", department)
        .eq("program", program);

      if (error) throw error;
      if (cancelledRef.cancelled) return;

      setCourseCodes(uniqSorted((data ?? []).map((r: any) => r?.course_code)));
    } catch (e: any) {
      console.log("Error loading course codes:", e?.message || e);
      if (!cancelledRef.cancelled) setCourseCodes([]);
    } finally {
      if (!cancelledRef.cancelled) setLoading(false);
    }
  };

  const loadBooks = async (
    department: string,
    program: string,
    courseCode: string,
    cancelledRef: { cancelled: boolean }
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("v_course_books")
        .select(
          "department, program, course_code, course_title, book_id, acc_no, call_no, title, author, publisher, copyright_year, num_vols, apa_citation"
        )
        .eq("department", department)
        .eq("program", program)
        .eq("course_code", courseCode)
        .order("book_id", { ascending: true });

      if (error) throw error;
      if (cancelledRef.cancelled) return;

      setBooks((data ?? []) as ViewRow[]);
    } catch (e: any) {
      console.log("Error loading books:", e?.message || e);
      if (!cancelledRef.cancelled) setBooks([]);
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
    resetCourseLevel();
    loadPrograms(selectedDepartment, cancelledRef);

    return () => {
      cancelledRef.cancelled = true;
    };
  }, [selectedDepartment]);

  useEffect(() => {
    const cancelledRef = { cancelled: false };

    if (!selectedDepartment || !selectedProgram) {
      resetCourseLevel();
      return () => {
        cancelledRef.cancelled = true;
      };
    }

    setSelectedCourseCode("");
    resetBooksLevel();
    loadCourseCodes(selectedDepartment, selectedProgram, cancelledRef);

    return () => {
      cancelledRef.cancelled = true;
    };
  }, [selectedDepartment, selectedProgram]);

  useEffect(() => {
    const cancelledRef = { cancelled: false };

    if (!selectedDepartment || !selectedProgram || !selectedCourseCode) {
      resetBooksLevel();
      return () => {
        cancelledRef.cancelled = true;
      };
    }

    loadBooks(selectedDepartment, selectedProgram, selectedCourseCode, cancelledRef);

    return () => {
      cancelledRef.cancelled = true;
    };
  }, [selectedDepartment, selectedProgram, selectedCourseCode]);

  const filteredBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return books;

    return books.filter((b) => {
      const haystack = [
        b.title,
        b.author,
        b.publisher,
        b.call_no,
        b.acc_no,
      ]
        .map((x) => (x ?? "").toString().toLowerCase())
        .join(" | ");

      return haystack.includes(q);
    });
  }, [books, searchTerm]);

  const printCourseLibrary = () => {
    if (!selectedCourseCode) return;

    const header = `${selectedCourseCode}${courseTitle ? ` - ${courseTitle}` : ""}`;
    const html = buildCoursePrintHtml(header, filteredBooks);

    const w = window.open("", "_blank", "width=1100,height=800");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

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
            <h1 className="pc-title">Program &amp; Course view</h1>

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
                className="pc-printbtn"
                disabled={!selectedCourseCode}
                onClick={printCourseLibrary}
              >
                Print
              </button>

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
            <div className="pc-leftCard">
              <SelectField
                label="Department"
                value={selectedDepartment}
                onChange={(v) => setSelectedDepartment(v)}
                options={departments}
                placeholder="Select Department"
              />

              <SelectField
                label="Program"
                value={selectedProgram}
                onChange={(v) => setSelectedProgram(v)}
                options={programs}
                placeholder="Select Program"
                disabled={!selectedDepartment}
              />

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

            <div className="pc-rightCard">
              <div className="pc-tableTop">
                <div className="pc-tableTitle">{selectedCourseCode || "Course Code"} Library</div>

              </div>

              <div className="pc-tableWrap">
                <table className="pc-table">
                  <thead>
                    <tr>
                      <th className="pc-center" style={{ width: 90 }}>
                        ID
                      </th>
                      <th style={{ width: 220 }}>Title</th>
                      <th style={{ width: 160 }}>Author</th>
                      <th style={{ width: 140 }}>Publisher</th>
                      <th className="pc-center" style={{ width: 70 }}>
                        Year
                      </th>
                      <th className="pc-center" style={{ width: 120 }}>
                        Call Number
                      </th>
                      <th className="pc-center" style={{ width: 90 }}>
                        Acc Num
                      </th>
                      <th className="pc-center" style={{ width: 95 }}>
                        Num of Vols
                      </th>
                      <th className="pc-center" style={{ width: 70 }}></th>
                    </tr>
                  </thead>

                  <tbody>
                    {showTableHint ? (
                      <tr>
                        <td colSpan={9} className="pc-rowMsg">
                          Select Department → Program → Course Code to view books.
                        </td>
                      </tr>
                    ) : loading ? (
                      <tr>
                        <td colSpan={9} className="pc-rowMsg">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredBooks.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="pc-rowMsg">
                          No books found for this course code.
                        </td>
                      </tr>
                    ) : (
                      filteredBooks.map((b, index) => (
                        <tr key={b.book_id}>
                          <td className="pc-center">{index + 1}</td>
                          <td>{b.title}</td>
                          <td>{b.author}</td>
                          <td>{b.publisher}</td>
                          <td className="pc-center">{b.copyright_year ?? ""}</td>
                          <td className="pc-center">{b.call_no ?? ""}</td>
                          <td className="pc-center">{b.acc_no ?? ""}</td>
                          <td className="pc-center">{b.num_vols ?? ""}</td>
                          <td className="pc-center">
                            <button
                              type="button"
                              className="pc-editbtn"
                              onClick={() =>
                                navigate(`/editing/${b.book_id}`, { state: { from: location.pathname } })
                              }
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
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
export default ProgramCourse;