import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/api/api"
import { User, Role } from "@/types"

const editUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "New password must be at least 8 characters").optional().or(z.literal('')),
  role_id: z.coerce.number().positive("Please select a role"),
})

type EditUserFormData = z.infer<typeof editUserSchema>

interface EditUserDialogProps {
  user: User;
  onUserUpdated: () => void;
  children: React.ReactNode;
}

async function fetchRoles(): Promise<Role[]> {
  const { data } = await api.get("/roles");
  return data.data.roles;
}

export function EditUserDialog({ user, onUserUpdated, children }: EditUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    enabled: open,
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      password: '',
      role_id: user.role_id || undefined,
    },
  })

  const onSubmit = async (data: EditUserFormData) => {
    setApiError(null)
    
    const payload: Partial<EditUserFormData> & { role_id: number } = {
      username: data.username,
      email: data.email,
      role_id: data.role_id,
    };

    if (data.password) {
      payload.password = data.password;
    }

    try {
      await api.patch(`/users/${user.user_id}`, payload)
      onUserUpdated()
      setOpen(false)
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Failed to update user.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) {
        // Reset form to user's current values when dialog opens
        reset({
          username: user.username,
          email: user.email,
          password: '',
          role_id: user.role_id || undefined,
        });
      } else {
        setApiError(null);
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the details for {user.username}. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <div className="col-span-3">
                <Input id="username" {...register("username")} />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3">
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                New Password
              </Label>
              <div className="col-span-3">
                <Input id="password" type="password" {...register("password")} placeholder="Leave blank to keep current" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role_id" className="text-right">
                Role
              </Label>
              <div className="col-span-3">
                <Controller
                  name="role_id"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value ? String(field.value) : undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingRoles ? (
                          <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                        ) : (
                          roles?.map((role) => (
                            <SelectItem key={role.role_id} value={String(role.role_id)}>
                              {role.role_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role_id && <p className="text-red-500 text-xs mt-1">{errors.role_id.message}</p>}
              </div>
            </div>
            {apiError && <p className="text-red-500 text-sm text-center col-span-4">{apiError}</p>}
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
