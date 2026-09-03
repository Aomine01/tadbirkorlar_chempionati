import { supabase } from "./supabase";

const SYNC_CHANNEL_NAME = "participants-realtime-sync";

let syncChannel: ReturnType<typeof supabase.channel> | null = null;

function getSyncChannel() {
  if (!syncChannel) {
    syncChannel = supabase.channel(SYNC_CHANNEL_NAME, {
      config: { broadcast: { self: false } },
    });
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
  const channel = getSyncChannel();

  channel.on("broadcast", { event: "participant-change" }, () => {
    onUpdate();
  });

  channel.on(
    "postgres_changes",
    { event: "*", schema: "public", table: "applications" },
    () => {
      onUpdate();
    }
  );

  // Auto-refresh when device wakes up or user focuses tab
  const handleVisibilityOrFocus = () => {
    if (document.visibilityState === "visible") {
      onUpdate();
    }
  };

  window.addEventListener("focus", handleVisibilityOrFocus);
  document.addEventListener("visibilitychange", handleVisibilityOrFocus);

  return () => {
    window.removeEventListener("focus", handleVisibilityOrFocus);
    document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
  };
}
