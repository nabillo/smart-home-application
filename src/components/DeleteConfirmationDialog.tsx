import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { Button } from './ui/Button';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  isLoading = false,
}: DeleteConfirmationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
