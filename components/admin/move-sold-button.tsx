"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, ArchiveRestore } from "lucide-react";
import { moveSoldArtPiecesToSoldCollection } from "@/app/admin/actions";

type Status = "idle" | "running" | "done" | "error";

export default function MoveSoldButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [movedCount, setMovedCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setStatus("running");
    setErrorMessage(null);
    try {
      const { movedCount } = await moveSoldArtPiecesToSoldCollection();
      setMovedCount(movedCount);
      setStatus("done");
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Onbekende fout");
      setStatus("error");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={status === "running"}
      className="group flex items-start gap-4 rounded-lg border border-border p-5 text-left transition-colors hover:bg-card disabled:opacity-70"
    >
      <div className="mt-0.5 shrink-0 text-muted-foreground">
        {status === "running" ? (
          <Loader2 size={20} className="animate-spin" />
        ) : status === "done" ? (
          <CheckCircle size={20} className="text-emerald-700" />
        ) : status === "error" ? (
          <AlertCircle size={20} className="text-red-700" />
        ) : (
          <ArchiveRestore size={20} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground">
          Verkochte werken verplaatsen
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {status === "done" && movedCount !== null
            ? `${movedCount} werk${movedCount === 1 ? "" : "en"} verplaatst naar de collectie 'eerdere werken'`
            : status === "error"
            ? `Er ging iets mis: ${errorMessage}`
            : "Verplaats alle reeds verkochte werken naar de collectie 'eerdere werken'"}
        </div>
      </div>
    </button>
  );
}
