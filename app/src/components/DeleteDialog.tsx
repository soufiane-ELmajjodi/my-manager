import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { Client } from '@/types/client';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  client: Client | null;
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  client,
}: DeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Delete Client
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-300">{client?.clientName}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="transition-colors"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-700 transition-colors"
          >
            Delete Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
