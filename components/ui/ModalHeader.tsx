// components/ui/modal/ModalHeader.tsx
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ModalHeaderProps {
  title: string;
  description: string;
}

export function ModalHeader({ title, description }: ModalHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  );
}
