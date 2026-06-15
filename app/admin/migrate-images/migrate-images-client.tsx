"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { resizeToWebP } from "@/lib/client/resize-image";
import { updateImageUrl, deleteStorageFiles } from "./actions";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2, ImageIcon, Trash2, ScanSearch } from "lucide-react";

interface DbImage {
  id: string;
  url: string;
  index: number;
  pieceId: string;
  pieceTitle: string;
}

type Status = "pending" | "migrating" | "done" | "skipped" | "error";

interface MigrationItem {
  image: DbImage;
  originalUrl: string;
  status: Status;
  error?: string;
}

function isNewStyle(url: string) {
  return /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/.test(url);
}

function storagePath(url: string): string | null {
  const marker = "/object/public/images/";
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : null;
}

// New-style files: {uuid}.webp or {uuid}-t.webp — keep these
const NEW_STYLE_FILE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(-t)?\.webp$/;

export default function MigrateImagesClient() {
  const [items, setItems] = useState<MigrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  // Orphan cleanup state
  const [orphans, setOrphans] = useState<string[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchImages() {
      const [{ data: images }, { data: pieces }] = await Promise.all([
        supabase.from("Image").select("id, url, index, pieceId"),
        supabase.from("ArtPiece").select("id, title"),
      ]);

      if (!images) { setLoading(false); return; }

      const pieceMap = new Map((pieces ?? []).map((p: any) => [p.id, p.title as string]));

      const mapped: MigrationItem[] = [...images]
        .sort((a: any, b: any) => (a.pieceId ?? "").localeCompare(b.pieceId ?? "") || a.index - b.index)
        .map((row: any) => ({
          image: {
            id: row.id,
            url: row.url,
            index: row.index,
            pieceId: row.pieceId,
            pieceTitle: pieceMap.get(row.pieceId) ?? "Onbekend",
          },
          originalUrl: row.url,
          status: isNewStyle(row.url) ? "skipped" : "pending",
        }));

      setItems(mapped);
      setLoading(false);
    }

    fetchImages();
  }, []);

  const pending = items.filter((i) => i.status === "pending").length;
  const done = items.filter((i) => i.status === "done").length;
  const errors = items.filter((i) => i.status === "error").length;
  const skipped = items.filter((i) => i.status === "skipped").length;
  const allDone = items.length > 0 && pending === 0 && !running;

  function updateItem(id: string, patch: Partial<MigrationItem>) {
    setItems((prev) =>
      prev.map((item) => (item.image.id === id ? { ...item, ...patch } : item))
    );
  }

  async function migrateImage(item: MigrationItem): Promise<void> {
    updateItem(item.image.id, { status: "migrating" });

    const res = await fetch(item.originalUrl);
    if (!res.ok) throw new Error(`Download mislukt: ${res.status}`);
    const blob = await res.blob();

    const [displayBlob, thumbBlob] = await Promise.all([
      resizeToWebP(blob, 1600, 0.85),
      resizeToWebP(blob, 200, 0.75),
    ]);

    const displayName = `${item.image.id}.webp`;
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(displayName, displayBlob, { contentType: "image/webp", upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    await supabase.storage
      .from("images")
      .upload(`${item.image.id}-t.webp`, thumbBlob, { contentType: "image/webp", upsert: true })
      .catch(() => {});

    const { data: urlData } = supabase.storage.from("images").getPublicUrl(displayName);
    await updateImageUrl(item.image.id, urlData.publicUrl);

    updateItem(item.image.id, { status: "done" });
  }

  async function migrateAll() {
    setRunning(true);
    for (const item of items.filter((i) => i.status === "pending")) {
      try {
        await migrateImage(item);
      } catch (err) {
        updateItem(item.image.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Onbekende fout",
        });
      }
    }
    setRunning(false);
  }

  async function scanOrphans() {
    setScanning(true);
    setOrphans(null);
    setDeleteConfirm(false);

    // List all files in the images bucket
    const { data: files } = await supabase.storage.from("images").list("", { limit: 1000 });
    const old = (files ?? [])
      .map((f) => f.name)
      .filter((name) => !NEW_STYLE_FILE.test(name));

    setOrphans(old);
    setScanning(false);
  }

  async function deleteOrphans() {
    if (!orphans || orphans.length === 0) return;
    setDeleting(true);
    setDeleteConfirm(false);
    try {
      await deleteStorageFiles(orphans);
      setOrphans([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Verwijderen mislukt");
    }
    setDeleting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-3xl font-light mb-2">Foto migratie</h1>
        <p className="text-muted-foreground mb-8">
          Converteert bestaande foto&apos;s naar WebP-varianten (1600px display + 200px thumbnail)
          voor snellere laadtijden. Nieuwe uploads worden automatisch al in dit formaat opgeslagen.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Te migreren", value: pending, color: "text-foreground" },
            { label: "Al klaar", value: skipped, color: "text-muted-foreground" },
            { label: "Gemigreerd", value: done, color: "text-green-600" },
            { label: "Fouten", value: errors, color: "text-red-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-lg p-4 text-center">
              <div className={`text-3xl font-light ${color}`}>{value}</div>
              <div className="text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Migrate action */}
        <div className="mb-8">
          {pending === 0 ? (
            <p className="text-green-600 font-medium">
              ✓ Alle foto&apos;s zijn al gemigreerd of verwerkt.
            </p>
          ) : (
            <Button onClick={migrateAll} disabled={running} className="gap-2">
              {running && <Loader2 className="h-4 w-4 animate-spin" />}
              {running ? "Bezig met migreren..." : `Migreer ${pending} foto${pending !== 1 ? "'s" : ""}`}
            </Button>
          )}
        </div>

        {/* Image list */}
        <div className="space-y-2 mb-12">
          {items.map((item) => (
            <div
              key={item.image.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg"
            >
              <div className="flex-shrink-0 w-6 flex justify-center">
                {item.status === "done" && <CheckCircle className="h-5 w-5 text-green-600" />}
                {item.status === "skipped" && <CheckCircle className="h-5 w-5 text-muted-foreground" />}
                {item.status === "migrating" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                {item.status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                {item.status === "pending" && <ImageIcon className="h-5 w-5 text-muted-foreground/40" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.image.pieceTitle}</div>
                <div className="text-xs text-muted-foreground truncate">
                  Foto {item.image.index + 1} &middot; {item.image.id}
                </div>
                {item.status === "error" && (
                  <div className="text-xs text-red-500 mt-0.5">{item.error}</div>
                )}
              </div>

              <div className="flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                  item.status === "done" ? "bg-green-100 text-green-700" :
                  item.status === "skipped" ? "bg-muted text-muted-foreground" :
                  item.status === "migrating" ? "bg-primary/10 text-primary" :
                  item.status === "error" ? "bg-red-100 text-red-700" :
                  "bg-muted/50 text-muted-foreground"
                }`}>
                  {item.status === "done" ? "Gemigreerd" :
                   item.status === "skipped" ? "Al klaar" :
                   item.status === "migrating" ? "Bezig..." :
                   item.status === "error" ? "Fout" : "Wachten"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Orphan cleanup — visible once all DB images are in new format */}
        {allDone && (
          <div className="border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-medium text-red-700 mb-1">Verouderde bestanden verwijderen</h2>
                <p className="text-sm text-muted-foreground">
                  Zoekt naar originele JPG/PNG bestanden in Storage die niet meer gebruikt worden
                  (alle DB-foto&apos;s zijn al omgezet naar WebP). <strong>Dit is onomkeerbaar.</strong>
                </p>
              </div>
            </div>

            {orphans === null && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={scanOrphans}
                disabled={scanning}
              >
                {scanning
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Scannen...</>
                  : <><ScanSearch className="h-4 w-4" /> Scan Storage</>
                }
              </Button>
            )}

            {orphans !== null && orphans.length === 0 && (
              <p className="text-green-600 font-medium text-sm">
                ✓ Geen verouderde bestanden gevonden. Storage is al schoon.
              </p>
            )}

            {orphans !== null && orphans.length > 0 && (
              <div className="space-y-3">
                <div className="bg-muted rounded-md p-3 max-h-48 overflow-y-auto">
                  {orphans.map((name) => (
                    <div key={name} className="text-xs text-muted-foreground font-mono py-0.5">{name}</div>
                  ))}
                </div>

                {!deleteConfirm ? (
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50 gap-2"
                    onClick={() => setDeleteConfirm(true)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    Verwijder {orphans.length} bestand{orphans.length !== 1 ? "en" : ""}
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-red-700 font-medium">Weet je het zeker?</p>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={deleteOrphans}
                      disabled={deleting}
                    >
                      {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {deleting ? "Bezig..." : "Ja, verwijder"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setDeleteConfirm(false)}
                      disabled={deleting}
                    >
                      Annuleren
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
