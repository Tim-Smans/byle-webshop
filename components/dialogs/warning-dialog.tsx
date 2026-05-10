"use client";

import BaseFeedbackDialog from "./base-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface WarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  onConfirm?: () => void;
}

const WarningDialog = ({
  open,
  onOpenChange,
  message,
  onConfirm,
}: WarningDialogProps) => {
  return (
    <BaseFeedbackDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Ben je zeker?"
      description={message}
      icon={<AlertTriangle className="text-yellow-500" />}
      actions={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm?.();
              onOpenChange(false);
            }}
          >
            Bevestigen
          </Button>
        </>
      }
    />
  );
}

export default WarningDialog