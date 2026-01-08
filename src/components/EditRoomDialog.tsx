import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Room } from '@/types';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Room name must be at least 2 characters.' }),
});

type EditRoomFormValues = z.infer<typeof formSchema>;

interface EditRoomDialogProps {
  room: Room;
  onSuccess: () => void;
  children: React.ReactNode;
}

async function updateRoom({ homeId, roomId, values }: { homeId: string; roomId: string; values: EditRoomFormValues }) {
  const { data } = await api.patch(`/homes/${homeId}/rooms/${roomId}`, values);
  return data;
}

export const EditRoomDialog = ({ room, onSuccess, children }: EditRoomDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<EditRoomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: room.name || '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateRoom,
    onSuccess: () => {
      toast.success('Room updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['rooms', room.home_id] });
      setIsOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to update room.';
      toast.error(errorMsg);
    },
  });

  const onSubmit = (values: EditRoomFormValues) => {
    mutate({ homeId: room.home_id, roomId: room.room_id, values });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <span onClick={() => setIsOpen(true)}>{children}</span>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
          <DialogDescription>
            Update the name of your room. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Living Room" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
