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
import api from "@/api"
import { User } from "@/pages/UsersPage"

interface DeleteUserDialogProps {
  user: User;
  onUserDeleted: () => void;
  children: React.ReactNode;
}

export function DeleteUserDialog({ user, onUserDeleted, children }: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await api.delete(`/users/${user.user_id}`)
      onUserDeleted()
      setOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account for <span className="font-bold">{user.username}</span> ({user.email}).
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Yes, delete user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
