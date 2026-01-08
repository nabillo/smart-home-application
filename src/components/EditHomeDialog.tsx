import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Home } from '@/types';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Home name must be at least 2 characters.' }),
});

type EditHomeFormValues = z.infer<typeof formSchema>;

interface EditHomeDialogProps {
  home: Home;
  onSuccess?: () => void;
  children: React.ReactNode;
}

async function updateHome({ homeId, values }: { homeId: string; values: EditHomeFormValues }) {
  const { data } = await api.patch(`/homes/${homeId}`, values);
  return data;
}

export const EditHomeDialog = ({ home, onSuccess, children }: EditHomeDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<EditHomeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: home.name || '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateHome,
    onSuccess: () => {
      toast.success('Home updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['homes'] });
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to update home.';
      toast.error(errorMsg);
    },
  });

  const onSubmit = (values: EditHomeFormValues) => {
    mutate({ homeId: home.home_id, values });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <span onClick={(e) => { e.preventDefault(); setIsOpen(true); }}>{children}</span>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Home</DialogTitle>
          <DialogDescription>
            Update the name of your home. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Smart Home" {...field} />
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
