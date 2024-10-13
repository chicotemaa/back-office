// components/ui/LoadingModal.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface LoadingModalProps {
  open: boolean;
}

export default function LoadingModal({ open }: LoadingModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </DialogContent>
    </Dialog>
  );
}