"use client";

import { useState } from "react";
import { findMemberByNumberAndEmail } from "./lib/members";
import { uploadFile } from "./lib/uploads";
import { supabase } from "./lib/supabase";

const bucketUrl =
  "https://tpdlctjvusbwiqzdmuuz.supabase.co/storage/v1/object/public/media-uploads/";

export default function HomePage() {
  const [memberNumber, setMemberNumber] = useState("");
  const [email, setEmail] = useState("");
  const [member, setMember] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [myUploads, setMyUploads] = useState<any[]>([]);

  async function loadMyUploads(memberNumber: string) {
    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .eq("member_number", memberNumber)
      .order("uploaded_at", { ascending: false });

    if (!error) {
      setMyUploads(data || []);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Controleren...");

    try {
      const foundMember = await findMemberByNumberAndEmail(
        memberNumber,
        email
      );

      if (!foundMember) {
        setMessage(
          "Geen actief lid gevonden met deze combinatie."
        );
        return;
      }

      setMember(foundMember);
      setMessage("");

      await loadMyUploads(foundMember.lidnummer);
    } catch (error: any) {
      setMessage(error.message || "Er ging iets mis.");
    }
  }

  if (member) {
    async function handleUpload(e: React.FormEvent) {
      e.preventDefault();

      const input = document.getElementById(
        "file"
      ) as HTMLInputElement;

      const file = input.files?.[0];

      if (!file) {
        alert("Kies eerst een bestand.");
        return;
      }

      try {
        await uploadFile(file, member);

        alert(
          "Upload gelukt. De media staat nu in review."
        );

        input.value = "";

        await loadMyUploads(member.lidnummer);
      } catch (error: any) {
        alert(error.message || "Upload mislukt.");
      }
    }

    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
          <h1 className="text-3xl font-black text-slate-950">
            Welkom {member.naam}
          </h1>

          <p className="mt-2 text-slate-600">
            Je bent ingelogd als actief lid van
            Dansondernemers.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm">
            <p>
              <strong>Lidnummer:</strong>{" "}
              {member.lidnummer}
            </p>

            <p>
              <strong>Dansschool:</strong>{" "}
              {member.dansschool}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {member.status}
            </p>
          </div>

          <form
            onSubmit={handleUpload}
            className="mt-6 space-y-4"
          >
            <input
              id="file"
              type="file"
              accept="image/*,video/*"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
            />

            <label className="flex gap-3 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
              <input type="checkbox" required />

              <span>
                Ik geef Nederland Danst toestemming om
                dit materiaal te gebruiken op
                nederlanddanst.nl en social media.
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:opacity-90"
            >
              Upload verzenden
            </button>
          </form>

          <div className="mt-8">
            <h2 className="text-xl font-black text-slate-950">
              Mijn uploads
            </h2>

            {myUploads.length === 0 && (
              <p className="mt-2 text-sm text-slate-500">
                Je hebt nog geen uploads.
              </p>
            )}

            <div className="mt-4 space-y-3">
              {myUploads.map((upload) => (
                <div
                  key={upload.id}
                  className="rounded-2xl bg-slate-100 p-4 text-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-200">
                      {upload.file_type?.startsWith(
                        "image"
                      ) ? (
                        <img
                          src={`${bucketUrl}${upload.file_url}`}
                          alt={upload.title || "Upload"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video className="h-full w-full object-cover">
                          <source
                            src={`${bucketUrl}${upload.file_url}`}
                          />
                        </video>
                      )}
                    </div>

                    <div>
                      <div className="font-bold">
                        {upload.title || "Zonder titel"}
                      </div>

                      <div className="mt-1 text-slate-500">
                        Status:{" "}
                        <strong>{upload.status}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="text-4xl font-black text-slate-950">
          Nederland Danst
        </h1>

        <p className="mt-2 text-slate-600">
          Login met je lidnummer en e-mailadres.
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-4"
        >
          <input
            type="text"
            placeholder="Lidnummer"
            value={memberNumber}
            onChange={(e) =>
              setMemberNumber(e.target.value)
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
          />

          <input
            type="email"
            placeholder="E-mailadres"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
          />

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:opacity-90"
          >
            Inloggen
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-slate-600">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}