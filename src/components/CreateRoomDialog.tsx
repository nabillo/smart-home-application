import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/api/api";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const roomSchema = z.object({
  name: z.string().min(3, "Room name must be at least 3 characters"),
  icon: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface CreateRoomDialogProps {
  homeId: string;
  onRoomCreated: () => void;
  children: React.ReactNode;
}

export function CreateRoomDialog({ homeId, onRoomCreated, children }: CreateRoomDialogProps) {
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
  });

  const onSubmit = async (data: RoomFormData) => {
    setApiError(null);
    try {
      await api.post(`/homes/${homeId}/rooms`, data);
      onRoomCreated();
      setOpen(false);
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Failed to create room.");
    }
  };

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
            <DialogTitle>Create New Room</DialogTitle>
            <DialogDescription>
              Add a new room to your home for better organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>
            {/* Icon input can be added here later */}
            {apiError && <p className="text-red-500 text-sm text-center col-span-4">{apiError}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
