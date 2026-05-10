"use client";

import BaseFeedbackDialog  from "./base-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { FC } from "react";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}

const ErrorDialog: FC<ErrorDialogProps> = ({
  open,
  onOpenChange,
  message,
}: ErrorDialogProps) => {
  return (
    <BaseFeedbackDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Er ging iets mis!"
      description={message}
      icon={<AlertCircle className="text-red-500" />}
      actions={
        <Button onClick={() => onOpenChange(false)}>
          Sluiten
        </Button>
      }
    />
  );
}

export default ErrorDialog