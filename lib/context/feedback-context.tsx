"use client";

import ErrorDialog from "@/components/dialogs/error-dialog";
import SuccessDialog from "@/components/dialogs/success-dialog";
import WarningDialog from "@/components/dialogs/warning-dialog";
import { createContext, useContext, useState, ReactNode } from "react";

type FeedbackType = "success" | "error" | "warning";

interface FeedbackState {
  type: FeedbackType;
  message: string;
  open: boolean;
  onConfirm?: () => void;
}

interface FeedbackContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string, onConfirm?: () => void) => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used inside provider");
  return ctx;
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    type: "success" | "error" | "warning";
    message: string;
    open: boolean;
    onConfirm?: () => void;
  } | null>(null);

  const showSuccess = (message: string) => {
    setState({ type: "success", message, open: true });
  };

  const showError = (message: string) => {
    setState({ type: "error", message, open: true });
  };

  const showWarning = (message: string, onConfirm?: () => void) => {
    setState({
      type: "warning",
      message,
      open: true,
      onConfirm,
    });
  };

  const close = () => {
    setState((prev) => (prev ? { ...prev, open: false } : null));
  };

  return (
    <FeedbackContext.Provider
      value={{ showSuccess, showError, showWarning }}
    >
      {children}

      {state?.type === "error" && (
        <ErrorDialog
          open={state.open}
          onOpenChange={close}
          message={state.message}
        />
      )}

      {state?.type === "success" && (
        <SuccessDialog
          open={state.open}
          onOpenChange={close}
          message={state.message}
        />
      )}

      {state?.type === "warning" && (
        <WarningDialog
          open={state.open}
          onOpenChange={close}
          message={state.message}
          onConfirm={state.onConfirm}
        />
      )}
    </FeedbackContext.Provider>
  );
}

export { FeedbackContext };