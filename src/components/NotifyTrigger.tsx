"use client";

import { useEffect, useRef } from "react";

// Pings the notify endpoint when the app is active, so reps get their daily
// digest of pending follow-ups. The endpoint dedups to once per rep per day,
// so triggering from every open tab / machine is harmless. Fires on load and
// every 30 minutes while the app stays open.
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
