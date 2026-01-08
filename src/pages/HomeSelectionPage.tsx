import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Home as HomeIcon, PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import api from '@/api/api';
import { Home } from '@/types';
import { Button } from '@/components/ui/Button';
import { CreateHomeDialog } from '@/components/CreateHomeDialog';
import { EditHomeDialog } from '@/components/EditHomeDialog';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

async function fetchHomes(): Promise<Home[]> {
  const { data } = await api.get('/homes');
  return data.data.homes;
}

async function deleteHome(homeId: string) {
  await api.delete(`/homes/${homeId}`);
}

const HomeSelectionPage = () => {
  const [homeToDelete, setHomeToDelete] = useState<Home | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: homes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['homes'],
    queryFn: fetchHomes,
  });

  const { mutate: performDeleteHome, isPending: isDeletingHome } = useMutation({
    mutationFn: deleteHome,
    onSuccess: () => {
      toast.success('Home deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['homes'] });
      setHomeToDelete(null);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to delete home.';
      toast.error(errorMsg);
    },
  });

  if (isLoading) return <div className="p-10">Loading your homes...</div>;
  if (isError) return <div className="p-10 text-destructive">Error fetching homes.</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Home Management</h1>
          <p className="mt-1 text-muted-foreground">Select a home to manage or create a new one.</p>
        </div>
        <CreateHomeDialog onHomeCreated={refetch}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Home
          </Button>
        </CreateHomeDialog>
      </div>

      {homes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homes.map((home) => (
            <div
              key={home.home_id}
              className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-start justify-between">
                <Link to={`/homes/${home.home_id}`} className="flex items-center gap-4 flex-grow">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HomeIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{home.name}</h3>
                    <p className="text-sm text-muted-foreground">{home.role_name}</p>
                  </div>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mt-1 -mr-1">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <EditHomeDialog home={home}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                    </EditHomeDialog>
                    <DropdownMenuItem onClick={() => setHomeToDelete(home)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-lg">
          <HomeIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No homes found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first home.</p>
          <div className="mt-6">
            <CreateHomeDialog onHomeCreated={refetch}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Home
              </Button>
            </CreateHomeDialog>
          </div>
        </div>
      )}

      {homeToDelete && (
        <DeleteConfirmationDialog
          open={!!homeToDelete}
          onOpenChange={(isOpen) => !isOpen && setHomeToDelete(null)}
          onConfirm={() => performDeleteHome(homeToDelete.home_id)}
          title={`Delete Home: ${homeToDelete.name}?`}
          description="This action cannot be undone. This will permanently delete the home and all of its rooms, devices, and associated data."
          isLoading={isDeletingHome}
        />
      )}
    </div>
  );
};

export default HomeSelectionPage;
