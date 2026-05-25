import { supabase } from "./supabase";

function getWeekNumber(date = new Date()) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;

  return Math.ceil(
    (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
  );
}

export async function getUploadCountThisWeek(member) {
  const now = new Date();
  const uploadWeek = getWeekNumber(now);
  const uploadYear = now.getFullYear();

  const { count, error } = await supabase
    .from("uploads")
    .select("*", { count: "exact", head: true })
    .eq("member_number", member.lidnummer)
.eq("upload_week", uploadWeek)
.eq("upload_year", uploadYear)
.neq("status", "rejected");

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function uploadFile(file, member) {
  const currentCount = await getUploadCountThisWeek(member);

  if (currentCount >= 5) {
    throw new Error(
      "Je hebt deze week het maximum van 5 uploads bereikt."
    );
  }

  const now = new Date();
  const uploadWeek = getWeekNumber(now);
  const uploadYear = now.getFullYear();

  const fileExt = file.name.split(".").pop();

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const filePath = `${member.lidnummer}/${fileName}`;

  const { error: storageError } = await supabase.storage
    .from("media-uploads")
    .upload(filePath, file);

  if (storageError) {
    throw storageError;
  }

  const { error: dbError } = await supabase.from("uploads").insert({
    member_number: member.lidnummer,
email: member.email,
dance_school: member.dansschool,
    file_url: filePath,
    file_type: file.type,
    consent_given: true,
    status: "review",
    upload_week: uploadWeek,
    upload_year: uploadYear,
  });

  if (dbError) {
    throw dbError;
  }

  return true;
}