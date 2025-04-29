import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface PromptDeleteAllDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  hasDeleteAllFunction: boolean;
}

const PromptDeleteAllDialog = ({
  open,
  onOpenChange,
  onConfirm,
  hasDeleteAllFunction,
}: PromptDeleteAllDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete all prompts?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete ALL prompts
            from your history.
            {!hasDeleteAllFunction && (
              <p className="mt-2 text-amber-500">
                Note: Using fallback method that may be slower. For optimal performance,
                please restart the application after this operation.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete All
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PromptDeleteAllDialog;
