// components/ui/modal/ModalFooter.tsx
import { DialogFooter } from "@/components/ui/dialog";
import { ReactNode } from "react";

interface ModalFooterProps {
  children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  return <DialogFooter>{children}</DialogFooter>;
}
