import { useState, useEffect, useRef } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, XCircle, Clock, Activity } from "lucide-react";

export default function ConnectionWidget({ connected, wsUrl }) {
  const [pingLog, setPingLog] = useState([]);
  const [testing, setTesting] = useState(false);
  const [latency, setLatency] = useState(null);
  const testWsRef = useRef(null);

  const runTest = () => {
    setTesting(true);
    const startTime = Date.now();
    const log = [];

    log.push({ time: new Date().toLocaleTimeString(), msg: `Connecting to ${wsUrl}...`, status: "pending" });
    setPingLog([...log]);

    try {
      const testWs = new WebSocket(wsUrl);
      testWsRef.current = testWs;

      testWs.onopen = () => {
        const elapsed = Date.now() - startTime;
        setLatency(elapsed);
        log.push({ time: new Date().toLocaleTimeString(), msg: `Connected in ${elapsed}ms`, status: "success" });
        setPingLog([...log]);

        // Send a ping-like message
        testWs.send(JSON.stringify({ type: "ping" }));
        log.push({ time: new Date().toLocaleTimeString(), msg: "Sent test ping", status: "success" });
        setPingLog([...log]);

        setTimeout(() => {
          testWs.close();
          log.push({ time: new Date().toLocaleTimeString(), msg: "Connection closed cleanly", status: "success" });
          setPingLog([...log]);
          setTesting(false);
        }, 500);
      };

      testWs.onerror = () => {
        log.push({ time: new Date().toLocaleTimeString(), msg: "Connection failed — server unreachable", status: "error" });
        setPingLog([...log]);
        setTesting(false);
      };

      testWs.onclose = (e) => {
        if (e.code !== 1000) {
          const reason = e.code === 1006 ? "Server rejected (no auth token)" : `Closed with code ${e.code}`;
          log.push({ time: new Date().toLocaleTimeString(), msg: reason, status: "warning" });
          setPingLog([...log]);
        }
        setTesting(false);
      };
    } catch (err) {
      log.push({ time: new Date().toLocaleTimeString(), msg: `Error: ${err.message}`, status: "error" });
      setPingLog([...log]);
      setTesting(false);
    }
  };

  useEffect(() => {
    return () => testWsRef.current?.close();
  }, []);

  const statusColor = connected ? "text-green-600" : "text-red-500";
  const statusBg = connected ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-neutral-900">WebSocket Health</h3>
        </div>
        <button
          onClick={runTest}
          disabled={testing}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${testing ? "animate-spin" : ""}`} />
          {testing ? "Testing..." : "Test"}
        </button>
      </div>

      {/* Status */}
      <div className="p-4 space-y-3">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${statusBg}`}>
          {connected ? (
            <Wifi className={`w-4 h-4 ${statusColor}`} />
          ) : (
            <WifiOff className={`w-4 h-4 ${statusColor}`} />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${statusColor}`}>
              {connected ? "Connected" : "Disconnected"}
            </p>
            <p className="text-xs text-neutral-500">{wsUrl}</p>
          </div>
          {latency !== null && (
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Clock className="w-3 h-3" />
              {latency}ms
            </div>
          )}
        </div>

        {/* Connection info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-neutral-50 rounded-lg px-3 py-2">
            <p className="text-neutral-400">Protocol</p>
            <p className="font-medium text-neutral-700 mt-0.5">WebSocket</p>
          </div>
          <div className="bg-neutral-50 rounded-lg px-3 py-2">
            <p className="text-neutral-400">Server</p>
            <p className="font-medium text-neutral-700 mt-0.5 truncate">{wsUrl.replace("ws://", "")}</p>
          </div>
        </div>

        {/* Test log */}
        {pingLog.length > 0 && (
          <div className="border border-neutral-100 rounded-lg overflow-hidden">
            <div className="px-3 py-1.5 bg-neutral-50 border-b border-neutral-100">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Test Log</p>
            </div>
            <div className="max-h-32 overflow-y-auto divide-y divide-neutral-50">
              {pingLog.map((entry, i) => (
                <div key={i} className="px-3 py-1.5 flex items-start gap-2">
                  {entry.status === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />}
                  {entry.status === "error" && <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />}
                  {entry.status === "pending" && <Clock className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />}
                  {entry.status === "warning" && <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-700">{entry.msg}</p>
                    <p className="text-[10px] text-neutral-400">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
