import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import LoginPage from './components/Login/LoginPage';
import Dashboard from './components/Dashboard/Dashboard';
import Editions from "./components/Editions/Editions"; 
import ProgramCourse from "./components/ProgramCourse/ProgramCourse"; 
import ReportSummary from "./components/ReportSummary/ReportSummary"; 
import BookEndcoding from "./components/BooksEncoding/BooksEncoding"; 

import type { Session } from '@supabase/supabase-js';

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BooksEncoding from './components/BooksEncoding/BooksEncoding';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

    if (!session) return <LoginPage />;

  return (
    <BrowserRouter>
      <Routes>
        {/* default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/program-course" element={<ProgramCourse />} />
        <Route path="/editions" element={<Editions />} />
        <Route path="/report-summary" element={<ReportSummary />} />
        <Route path="/books-encoding" element={<BooksEncoding />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
