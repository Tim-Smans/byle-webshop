"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteNewsletterSubscriber } from "@/app/admin/actions";
import { useFeedback } from "@/lib/context/feedback-context";

export default function DeleteSubscriberButton({ id, email }: { id: string; email: string }) {
  const router = useRouter();
  const { showWarning, showError } = useFeedback();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNewsletterSubscriber(id);
      router.refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Onbekende fout");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={() => showWarning(`${email} uitschrijven van de nieuwsbrief?`, handleDelete)}
      disabled={isDeleting}
      className="text-muted-foreground hover:text-red-700 transition-colors disabled:opacity-50"
      aria-label={`${email} verwijderen`}
    >
      {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}
