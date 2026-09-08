import { supabase } from "./supabase";

const SYNC_CHANNEL_NAME = "participants-realtime-sync";
const BROWSER_CHANNEL_NAME = "jamgarma_participant_sync";
const STORAGE_PING_KEY = "jamgarma_participant_sync_ping";

type ParticipantChangeCallback = (payload?: any) => void;

const listeners = new Set<ParticipantChangeCallback>();
let syncChannel: ReturnType<typeof supabase.channel> | null = null;
let browserBc: BroadcastChannel | null = null;

// Initialize native Browser BroadcastChannel for 0ms cross-tab sync
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    browserBc = new BroadcastChannel(BROWSER_CHANNEL_NAME);
    browserBc.onmessage = (event) => {
      notifyListeners(event.data);
    };
  }
} catch (err) {
  console.warn("BroadcastChannel not supported or error:", err);
}

// Cross-tab fallback via localStorage storage events
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_PING_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        notifyListeners(parsed);
      } catch {
        notifyListeners();
      }
    }
  });
}

function notifyListeners(payload?: any) {
  listeners.forEach((cb) => {
    try {
      cb(payload);
    } catch (e) {
      console.error("Error in participant sync listener:", e);
    }
  });
}

function getSyncChannel() {
  if (!syncChannel) {
    syncChannel = supabase.channel(SYNC_CHANNEL_NAME, {
      config: { broadcast: { self: true } },
    });

    // Register all callbacks BEFORE calling subscribe()!
    syncChannel
      .on("broadcast", { event: "participant-change" }, (payload) => {
        notifyListeners(payload);
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        (payload) => {
          notifyListeners(payload);
        }
      );

    syncChannel.subscribe((status) => {
      if (status === "CHANNEL_ERROR") {
        console.warn("Realtime sync channel error, will auto-reconnect.");
      }
    });
  }
  return syncChannel;
}

/**
 * Broadcasts an instant change notification across all active devices/tabs/windows.
 */
export async function broadcastParticipantChange(
  action: "added" | "deleted" | "updated",
  details?: Record<string, any>
) {
  const payload = { action, timestamp: Date.now(), ...details };

  // 1. Immediately notify current window/tab listeners
  notifyListeners(payload);

  // 2. Broadcast to all other open tabs in the same browser (0ms latency)
  try {
    if (browserBc) {
      browserBc.postMessage(payload);
    }
  } catch (err) {
    console.warn("Local broadcast error:", err);
  }

  // 3. Fallback cross-tab notification via localStorage
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_PING_KEY, JSON.stringify(payload));
    }
  } catch {
    // Ignore storage quota or disabled storage errors
  }

  // 4. Supabase cloud broadcast for cross-device/network synchronization
  try {
    const channel = getSyncChannel();
    await channel.send({
      type: "broadcast",
      event: "participant-change",
      payload,
    });
  } catch (err) {
    console.warn("Supabase realtime broadcast error:", err);
  }
}

/**
 * Subscribes to multi-device instant updates.
 * Fires onUpdate when:
 * 1. An action is broadcasted from any other device/tab or current tab.
 * 2. Local browser BroadcastChannel message received.
 * 3. PostgreSQL CDC notification fires.
 * 4. User switches back to the tab / device wakes up.
 * 5. Heartbeat background poll every 30s.
 */
export function subscribeToParticipantChanges(onUpdate: () => void) {
  // Ensure the singleton Supabase channel is initialized
  getSyncChannel();

  // Register the callback
  listeners.add(onUpdate);

  // Auto-refresh when device wakes up or user focuses tab
  let lastFocusSync = Date.now();
  const handleVisibilityOrFocus = () => {
    if (document.visibilityState === "visible") {
      const now = Date.now();
      // Throttle focus sync to max once every 3 seconds to avoid duplicate refetches
      if (now - lastFocusSync > 3000) {
        lastFocusSync = now;
        onUpdate();
      }
    }
  };

  window.addEventListener("focus", handleVisibilityOrFocus);
  document.addEventListener("visibilitychange", handleVisibilityOrFocus);

  // Periodic background sync every 30s while tab is visible
  const interval = setInterval(() => {
    if (document.visibilityState === "visible") {
      onUpdate();
    }
  }, 30000);

  return () => {
    listeners.delete(onUpdate);
    window.removeEventListener("focus", handleVisibilityOrFocus);
    document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    clearInterval(interval);
  };
}
