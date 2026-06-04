import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function App() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    // Lightweight connectivity check. Replace with a real query once
    // your tables exist, e.g. supabase.from("pets").select("*").
    async function check() {
      try {
        const { error } = await supabase.auth.getSession();
        setStatus(error ? "error" : "connected");
      } catch {
        setStatus("not-configured");
      }
    }
    check();
  }, []);

  const statusStyles = {
    checking: "bg-gray-100 text-gray-700",
    connected: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    "not-configured": "bg-amber-100 text-amber-800",
  };

  const statusLabel = {
    checking: "Checking Supabase connection...",
    connected: "Supabase connected",
    error: "Supabase error",
    "not-configured": "Supabase not configured (add credentials to .env)",
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Pet Clinic Management
        </h1>
        <p className="mt-2 text-slate-500">
          React + Tailwind + Supabase starter
        </p>
        <span
          className={`mt-6 inline-block rounded-full px-4 py-1.5 text-sm font-medium ${statusStyles[status]}`}
        >
          {statusLabel[status]}
        </span>
      </div>
    </div>
  );
}

export default App;
