"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const bucketUrl =
  "https://tpdlctjvusbwiqzdmuuz.supabase.co/storage/v1/object/public/media-uploads/";

export default function GalleryPage() {
  const [uploads, setUploads] = useState<any[]>([]);

  async function loadGallery() {
    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .eq("status", "approved")
      .order("uploaded_at", { ascending: false });

    if (!error) {
      setUploads(data || []);
    }
  }

  useEffect(() => {
    loadGallery();
  }, []);

  return (
    <main className="min-h-screen bg-black p-2">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
        {uploads.map((upload) => (
          <div
            key={upload.id}
            className="overflow-hidden rounded-2xl bg-zinc-900"
          >
            {upload.file_type?.startsWith("image") ? (
              <img
                src={`${bucketUrl}${upload.file_url}`}
                alt="Nederland Danst"
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                controls
                className="h-full w-full object-cover"
              >
                <source
                  src={`${bucketUrl}${upload.file_url}`}
                />
              </video>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}