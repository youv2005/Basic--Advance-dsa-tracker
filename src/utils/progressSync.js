import { supabase } from "../lib/supabase";

export async function loadCloudProgress(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_progress")
    .select("progress")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.progress ?? null;
}

export async function saveCloudProgress(userId, progress) {
  if (!userId) return;

  const { error } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: userId,
        progress,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    throw error;
  }
}