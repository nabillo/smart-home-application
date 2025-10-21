import { useEffect, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import api from '@/api';
import { Role, Permission } from '@/types';
import { DataTable } from '@/components/DataTable';
import { roleColumns } from '@/components/roleColumns';
import { CreateRoleDialog } from '@/components/CreateRoleDialog';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';

const AccessManagementPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions'),
      ]);
      setRoles(rolesResponse.data.data.roles || []);
      setPermissions(permissionsResponse.data.data.permissions || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch access management data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const table = useReactTable({
    data: roles,
    columns: roleColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    meta: {
      refreshData: fetchData,
      allPermissions: permissions,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Access Management</h1>
          <p className="mt-1 text-muted-foreground">Manage user roles and their permissions.</p>
        </div>
        <CreateRoleDialog onRoleCreated={fetchData}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </CreateRoleDialog>
      </div>
      <DataTable table={table} columns={roleColumns} />
    </div>
  );
};

export default AccessManagementPage;
