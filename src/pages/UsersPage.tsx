import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

import api from "@/api";
import { columns } from "@/components/columns";
import { DataTable } from "@/components/DataTable";
import { AddUserDialog } from "@/components/AddUserDialog";
import { Input } from "@/components/ui/Input";
import { User } from "@/types";

async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get("/users");
  return data.data.users;
}

export default function UsersPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    meta: {
      refreshUsers: refetch,
    }
  });

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error fetching users.</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage user accounts and roles.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <AddUserDialog onUserAdded={refetch} />
      </div>
      <DataTable table={table} columns={columns} />
    </div>
  );
}
