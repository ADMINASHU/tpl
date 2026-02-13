"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { ref, get } from "firebase/database";

export default function JsDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [envCheck, setEnvCheck] = useState<any>({});
  const [dbStatus, setDbStatus] = useState("Checking...");

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    // 1. Capture Global Errors
    window.onerror = (message, source, lineno, colno, error) => {
      addLog(`ERROR: ${message} at ${source}:${lineno}:${colno}`);
    };

    window.onunhandledrejection = (event) => {
        addLog(`UNHANDLED PROMISE: ${event.reason}`);
    };

    // 2. Check Environment Variables (Next.js Public)
    const envs = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Present" : "MISSING",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Present" : "MISSING",
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // Show full URL to verify fallback
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Present" : "MISSING",
    };
    setEnvCheck(envs);
    addLog("Environment variables checked.");

    // 3. Test Firebase Connection
    const testFirebase = async () => {
        try {
            addLog("Attempting to connect to Firebase...");
            const testRef = ref(db, ".info/connected");
            const snapshot = await get(testRef);
            addLog(`Firebase Connection Test: ${snapshot.exists() ? "Data Received" : "No Data"}`);
            addLog(`Value: ${String(snapshot.val())}`);
            setDbStatus("Connected (Read successful)");
        } catch (e: any) {
            addLog(`FIREBASE ERROR: ${e.message}`);
            setDbStatus("Failed");
        }
    };

    testFirebase();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px', background: '#111', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ borderBottom: '1px solid #0f0', paddingBottom: '10px', marginBottom: '20px', fontSize: '24px' }}>JS/Firebase Diagnostic</h1>

      <section style={{ marginBottom: '20px' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '18px' }}>1. Environment Config</h2>
        <pre style={{ background: '#222', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(envCheck, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '18px' }}>2. Database Status</h2>
        <div style={{ fontSize: '18px', color: dbStatus === 'Failed' ? '#f55' : '#4af' }}>
            {dbStatus}
        </div>
      </section>

      <section>
        <h2 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '18px' }}>3. Logs / Errors</h2>
        <div style={{ background: '#222', padding: '10px', borderRadius: '4px', height: '300px', overflow: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
            {logs.length === 0 ? "No logs yet..." : logs.map((log, i) => (
                <div key={i} style={{ borderBottom: '1px solid #444', padding: '4px 0' }}>{log}</div>
            ))}
        </div>
      </section>
    </div>
  );
}
