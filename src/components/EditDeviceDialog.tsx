import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Device, Room } from '@/types';
import api from '@/api/api';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

const formSchema = z.object({
  name: z.string().min(2, { message: 'Device name must be at least 2 characters.' }),
  room_id: z.string().nullable(),
});

type EditDeviceFormValues = z.infer<typeof formSchema>;

interface EditDeviceDialogProps {
  device: Device;
  rooms: Room[];
  onSuccess: () => void;
  children: React.ReactNode;
}

async function updateDevice({ homeId, deviceId, values }: { homeId: string; deviceId: string; values: EditDeviceFormValues }) {
  const { data } = await api.patch(`/homes/${homeId}/devices/${deviceId}`, values);
  return data;
}

export const EditDeviceDialog = ({ device, rooms, onSuccess, children }: EditDeviceDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { control, handleSubmit, formState: { errors } } = useForm<EditDeviceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: device.name || '',
      room_id: device.room_id || null,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateDevice,
    onSuccess: () => {
      toast.success('Device updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['devices', device.home_id] });
      setIsOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to update device.';
      toast.error(errorMsg);
    },
  });

  const onSubmit = (values: EditDeviceFormValues) => {
    mutate({ homeId: device.home_id, deviceId: device.device_id, values });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <span onClick={() => setIsOpen(true)}>{children}</span>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
          <DialogDescription>
            Update the device's name and location.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div>
                <Label htmlFor="name">Device Name</Label>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => <Input id="name" {...field} className="mt-1" />}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
                <Label htmlFor="room_id">Location</Label>
                <Controller
                  name="room_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(value) => field.onChange(value === 'home' ? null : value)} defaultValue={field.value || 'home'}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Assign to Home</SelectItem>
                        {rooms.map(room => (
                          <SelectItem key={room.room_id} value={room.room_id}>{room.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
};
