"use client";

import { useEffect, useRef } from "react";

// Pings the notify endpoint while the app is active, so reps get reminded about
// pending follow-ups. The endpoint dedups to once per rep per 3-hour window, so
// triggering from every open tab / machine is harmless. Polls on load and every
// 30 minutes — the backend ensures each rep is emailed at most once per 3 hours.
export function NotifyTrigger() {
  const fired = useRef(false);

  useEffect(() => {
    const ping = () => {
      fetch("/api/notify", { method: "POST" }).catch(() => {});
    };

    if (!fired.current) {
      fired.current = true;
      ping();
    }

    const id = setInterval(ping, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return null;
}
