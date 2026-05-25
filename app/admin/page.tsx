"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminPage() {
  const [uploads, setUploads] = useState<any[]>([]);

  const bucketUrl =
    "https://tpdlctjvusbwiqzdmuuz.supabase.co/storage/v1/object/public/media-uploads/";

  async function loadUploads() {
    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setUploads(data || []);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("uploads")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadUploads();
  }

  async function rejectAndDelete(upload: any) {
    const confirmed = confirm(
      "Weet je zeker dat je deze upload wilt afkeuren en definitief verwijderen?"
    );

    if (!confirmed) return;

    console.log("Verwijderen:", upload);

    // Eerst media verwijderen uit storage
    const { error: storageError } = await supabase.storage
      .from("media-uploads")
      .remove([upload.file_url]);

    if (storageError) {
      console.error(storageError);
      alert("Storage fout: " + storageError.message);
      return;
    }

    // Daarna database record verwijderen
    const { error: dbError } = await supabase
      .from("uploads")
      .delete()
      .eq("id", upload.id);

    if (dbError) {
      console.error(dbError);
      alert("Database fout: " + dbError.message);
      return;
    }

    alert("Upload verwijderd.");

    setUploads((currentUploads) =>
  currentUploads.filter((item) => item.id !== upload.id)
);
  }

  useEffect(() => {
    loadUploads();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black">
          Nederland Danst Admin
        </h1>

        <p className="mt-2 text-slate-600">
          Review alle uploads.
        </p>

        <div className="mt-6 space-y-4">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="rounded-2xl bg-white p-5 shadow"
            >
              <div className="font-bold">
                {upload.title || "Zonder titel"}
              </div>

              <div className="text-sm text-slate-500">
                {upload.dance_school} · {upload.member_number}
              </div>

              <div className="mt-2 text-sm">
                Status: <strong>{upload.status}</strong>
              </div>

              <div className="mt-4">
                {upload.file_type?.startsWith("image") ? (
                  <img
                    src={`${bucketUrl}${upload.file_url}`}
                    alt={upload.title || "Nederland Danst upload"}
                    className="max-h-80 rounded-2xl border"
                  />
                ) : (
                  <video
                    controls
                    className="max-h-80 rounded-2xl border"
                  >
                    <source
                      src={`${bucketUrl}${upload.file_url}`}
                    />
                  </video>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    updateStatus(upload.id, "approved")
                  }
                  className="rounded-xl bg-green-600 px-4 py-2 text-white"
                >
                  Goedkeuren
                </button>

                <button
                  onClick={() => rejectAndDelete(upload)}
                  className="rounded-xl bg-red-600 px-4 py-2 text-white"
                >
                  Afkeuren & verwijderen
                </button>

                <button
                  onClick={() =>
                    updateStatus(upload.id, "published")
                  }
                  className="rounded-xl bg-slate-950 px-4 py-2 text-white"
                >
                  Gepubliceerd
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}