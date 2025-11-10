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
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/api/api"

const createRoleSchema = z.object({
  role_name: z.string().min(3, "Role name must be at least 3 characters"),
})

type CreateRoleFormData = z.infer<typeof createRoleSchema>

interface CreateRoleDialogProps {
  onRoleCreated: () => void;
  children: React.ReactNode;
}

export function CreateRoleDialog({ onRoleCreated, children }: CreateRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
  })

  const onSubmit = async (data: CreateRoleFormData) => {
    setApiError(null)
    try {
      await api.post("/roles", data)
      onRoleCreated()
      setOpen(false)
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Failed to create role.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        reset();
        setApiError(null);
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>
              Create a new role to assign to users. You can assign permissions after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role_name" className="text-right">
                Role Name
              </Label>
              <div className="col-span-3">
                <Input id="role_name" {...register("role_name")} />
                {errors.role_name && <p className="text-red-500 text-xs mt-1">{errors.role_name.message}</p>}
              </div>
            </div>
            {apiError && <p className="text-red-500 text-sm text-center col-span-4">{apiError}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
