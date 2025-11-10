import { useState } from "react"
import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/Dialog"
import api from "@/api/api"
import { Role } from "@/types"

interface DeleteRoleDialogProps {
  role: Role;
  onRoleDeleted: () => void;
  children: React.ReactNode;
}

export function DeleteRoleDialog({ role, onRoleDeleted, children }: DeleteRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    setApiError(null)
    try {
      await api.delete(`/roles/${role.role_id}`)
      onRoleDeleted()
      setOpen(false)
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Failed to delete role.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the role "{role.role_name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {apiError && (
          <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
            <p className="text-sm text-destructive">{apiError}</p>
          </div>
        )}
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
