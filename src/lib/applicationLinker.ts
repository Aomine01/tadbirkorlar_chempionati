import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";
import type { Application, Profile } from "../types/database";

export const DEFAULT_IMPORTER_ID = "f8fdd430-05f6-4fd9-b662-bb40c7dfaf6a";

/**
 * Normalizes phone numbers to pure digits without country code variations
 * e.g. "+998 (94) 572-22-52" -> "998945722252"
 */
export function extractPhoneDigits(raw?: string | null): string {
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 9) digits = "998" + digits;
  return digits;
}

/**
 * Attempts to load the user's application.
 * If the user does not have a directly linked application, it automatically looks for
 * an unclaimed imported application (owned by DEFAULT_IMPORTER_ID) matching the user's
 * phone number, email ID tag, or founder name, and links it to user.id on the fly.
 */
export async function getOrLinkUserApplication(
  user: User,
  profile?: Profile | null
): Promise<Application | null> {
  if (!user) return null;

  try {
    // 1. Direct query by user_id
    const { data: directApps, error: directErr } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!directErr && directApps && directApps.length > 0) {
      return directApps[0];
    }

    // 2. If no direct application, look for matching imported application
    const userPhoneDigits = extractPhoneDigits(
      profile?.phone_number || (user.user_metadata?.phone_number as string)
    );
    const userEmail = (user.email || "").toLowerCase().trim();
    const userFullName = (
      profile?.full_name || (user.user_metadata?.full_name as string) || ""
    )
      .toLowerCase()
      .trim();

    // Check if email itself contains phone digits (e.g. 998945722252@chempionat.uz)
    const emailPhoneDigits = extractPhoneDigits(userEmail.split("@")[0]);
    const effectivePhoneDigits =
      userPhoneDigits && userPhoneDigits !== "998901234567"
        ? userPhoneDigits
        : emailPhoneDigits && emailPhoneDigits !== "998901234567"
        ? emailPhoneDigits
        : "";

    // Fetch unclaimed applications
    const { data: unclaimedApps, error: unclaimedErr } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", DEFAULT_IMPORTER_ID)
      .eq("is_deleted", false);

    if (unclaimedErr || !unclaimedApps || unclaimedApps.length === 0) {
      return null;
    }

    let matched: Application | null = null;

    // Strategy A: Match by 6-character shortId in generated email (e.g. asadullohabdur_bc8ffe@chempionat.uz)
    if (userEmail.includes("@chempionat.uz")) {
      const emailPrefix = userEmail.split("@")[0];
      matched =
        unclaimedApps.find((a) => {
          const shortId = a.id.replace(/-/g, "").slice(0, 6);
          return emailPrefix.endsWith(`_${shortId}`) || emailPrefix.includes(shortId);
        }) || null;
    }

    // Strategy B: Match by phone number
    if (!matched && effectivePhoneDigits && effectivePhoneDigits.length >= 9) {
      matched =
        unclaimedApps.find((a) => {
          const appPhoneMatch = a.business_description?.match(
            /\[Phone:\s*([^\]]+)\]/i
          );
          if (!appPhoneMatch) return false;
          const appPhoneDigits = extractPhoneDigits(appPhoneMatch[1]);
          return appPhoneDigits === effectivePhoneDigits;
        }) || null;
    }

    // Strategy C: Match by founder name
    if (!matched && userFullName && userFullName.length >= 5) {
      matched =
        unclaimedApps.find((a) => {
          const founderMatch = a.business_description?.match(
            /\[Founder:\s*([^\]]+)\]/i
          );
          if (!founderMatch) return false;
          const founder = founderMatch[1].toLowerCase().trim();
          return (
            founder === userFullName ||
            (founder.length > 5 && (userFullName.includes(founder) || founder.includes(userFullName)))
          );
        }) || null;
    }

    // If an unclaimed application was matched, link it to the user
    if (matched) {
      console.log(`[AutoLinker] Successfully matched application ${matched.id} to user ${user.id}`);
      const { error: updateErr } = await supabase
        .from("applications")
        .update({ user_id: user.id })
        .eq("id", matched.id);

      if (!updateErr) {
        return { ...matched, user_id: user.id };
      } else {
        console.error("[AutoLinker] Failed to update application user_id:", updateErr);
        return matched;
      }
    }

    return null;
  } catch (err) {
    console.error("[AutoLinker] Unexpected error linking application:", err);
    return null;
  }
}
