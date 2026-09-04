import { supabase } from "./supabase";

const SYNC_CHANNEL_NAME = "participants-realtime-sync";

type ParticipantChangeCallback = (payload?: any) => void;

const listeners = new Set<ParticipantChangeCallback>();
let syncChannel: ReturnType<typeof supabase.channel> | null = null;

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
      config: { broadcast: { self: false } },
    });

    // Register all callbacks BEFORE calling subscribe()!
    // Calling channel.on() after channel.subscribe() throws an error in Supabase JS.
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
 * Broadcasts an instant change notification across all active devices/tabs.
 */
export async function broadcastParticipantChange(
  action: "added" | "deleted" | "updated",
  details?: Record<string, any>
) {
  try {
    const channel = getSyncChannel();
    await channel.send({
      type: "broadcast",
      event: "participant-change",
      payload: { action, timestamp: Date.now(), ...details },
    });
  } catch (err) {
    console.warn("Realtime broadcast error:", err);
  }
}

/**
 * Subscribes to multi-device instant updates.
 * Fires onUpdate when:
 * 1. An action is broadcasted from any other device/tab.
 * 2. PostgreSQL CDC notification fires.
 * 3. User switches back to the tab / device wakes up.
 */
export function subscribeToParticipantChanges(onUpdate: () => void) {
  // Ensure the singleton channel is initialized with event listeners attached prior to subscription
  getSyncChannel();

  // Register the callback
  listeners.add(onUpdate);

  // Auto-refresh when device wakes up or user focuses tab
  const handleVisibilityOrFocus = () => {
    if (document.visibilityState === "visible") {
      onUpdate();
    }
  };

  window.addEventListener("focus", handleVisibilityOrFocus);
  document.addEventListener("visibilitychange", handleVisibilityOrFocus);

  return () => {
    listeners.delete(onUpdate);
    window.removeEventListener("focus", handleVisibilityOrFocus);
    document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
  };
}
