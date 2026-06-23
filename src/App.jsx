import { lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import Login from "./components/Login";
import UpdatePassword from "./components/UpdatePassword";
import AppShell from "./components/layout/AppShell";
import ToastProvider from "./components/ui/ToastProvider";

// Route pages are code-split so the initial bundle stays small.
const Dashboard = lazy(() => import("./components/Dashboard"));
const VetCalendar = lazy(() => import("./pages/VetCalendar"));
const Grooming = lazy(() => import("./pages/Grooming"));
const Clients = lazy(() => import("./pages/Clients"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const ActivityLogs = lazy(() => import("./pages/ActivityLogs"));

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  let content;
  if (loading) {
    content = (
      <div className="min-h-screen w-full bg-page flex items-center justify-center">
        <p className="font-nunito text-muted">Loading...</p>
      </div>
    );
  } else if (recovery) {
    content = <UpdatePassword onDone={() => setRecovery(false)} />;
  } else if (!session) {
    content = <Login />;
  } else {
    content = (
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppShell session={session} />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<VetCalendar />} />
            <Route path="grooming" element={<Grooming />} />
            <Route path="clients" element={<Clients />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="activity" element={<ActivityLogs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }

  return <ToastProvider>{content}</ToastProvider>;
}

export default App;
