"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FC, ReactNode } from "react";

interface BaseFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

const BaseFeedbackDialog: FC<BaseFeedbackDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  icon,
  actions,
}: BaseFeedbackDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {icon}
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
          </div>

          <DialogDescription asChild>
            <div className="text-sm leading-relaxed text-muted-foreground pt-2">
              {description}
            </div>
          </DialogDescription>
        </DialogHeader>

        {actions && <div className="mt-4 flex justify-end gap-2">{actions}</div>}
      </DialogContent>
    </Dialog>
  );
}

export default BaseFeedbackDialog