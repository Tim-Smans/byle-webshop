"use client";

import BaseFeedbackDialog from "./base-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { FC } from "react";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}

const SuccessDialog: FC<SuccessDialogProps> = ({
  open,
  onOpenChange,
  message,
}: SuccessDialogProps) => {
  return (
    <BaseFeedbackDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Success"
      description={message}
      icon={<CheckCircle className="text-green-500" />}
      actions={
        <Button onClick={() => onOpenChange(false)}>
          Nice
        </Button>
      }
    />
  );
}

export default SuccessDialog