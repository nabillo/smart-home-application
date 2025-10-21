import { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/Checkbox"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/api"
import { Role, Permission } from "@/types"

const editRoleSchema = z.object({
  role_name: z.string().min(3, "Role name must be at least 3 characters"),
  permission_ids: z.array(z.number()).default([]),
})

type EditRoleFormData = z.infer<typeof editRoleSchema>

interface EditRoleDialogProps {
  role: Role;
  allPermissions: Permission[];
  onRoleUpdated: () => void;
  children: React.ReactNode;
}

export function EditRoleDialog({ role, allPermissions, onRoleUpdated, children }: EditRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditRoleFormData>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      role_name: role.role_name,
      permission_ids: role.permissions.map(p => p.permission_id),
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        role_name: role.role_name,
        permission_ids: role.permissions.map(p => p.permission_id),
      });
    }
  }, [open, role, reset]);

  const onSubmit = async (data: EditRoleFormData) => {
    setApiError(null)
    try {
      await api.patch(`/roles/${role.role_id}`, data)
      onRoleUpdated()
      setOpen(false)
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Failed to update role.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Role: {role.role_name}</DialogTitle>
            <DialogDescription>
              Update the role name and assign permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div>
              <Label htmlFor="role_name">Role Name</Label>
              <Input id="role_name" {...register("role_name")} className="mt-1" />
              {errors.role_name && <p className="text-red-500 text-xs mt-1">{errors.role_name.message}</p>}
            </div>
            <div>
              <Label>Permissions</Label>
              <Controller
                name="permission_ids"
                control={control}
                render={({ field }) => (
                  <div className="mt-2 grid grid-cols-2 gap-4 max-h-60 overflow-y-auto rounded-md border border-border p-4">
                    {(allPermissions || []).map(permission => (
                      <div key={permission.permission_id} className="flex items-center gap-2">
                        <Checkbox
                          id={`perm-${permission.permission_id}`}
                          checked={field.value?.includes(permission.permission_id)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            return checked
                              ? field.onChange([...currentValue, permission.permission_id])
                              : field.onChange(currentValue.filter(id => id !== permission.permission_id))
                          }}
                        />
                        <Label htmlFor={`perm-${permission.permission_id}`} className="font-normal text-sm">
                          {permission.permission_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
            {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
