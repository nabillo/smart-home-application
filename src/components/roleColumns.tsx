"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Role, Permission } from "@/types"
import { MoreHorizontal, ArrowUpDown, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { Badge } from "@/components/ui/Badge"
import { EditRoleDialog } from "./EditRoleDialog"
import { DeleteRoleDialog } from "./DeleteRoleDialog"

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    refreshData: () => void
    allPermissions: Permission[]
  }
}

export const roleColumns: ColumnDef<Role>[] = [
  {
    accessorKey: "role_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("role_name")}</div>,
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.original.permissions
      if (!permissions || permissions.length === 0) {
        return <span className="text-muted-foreground">No permissions</span>
      }
      return (
        <div className="flex flex-wrap gap-1">
          {permissions.slice(0, 4).map((p) => (
            <Badge key={p.permission_id} variant="secondary">{p.permission_name}</Badge>
          ))}
          {permissions.length > 4 && (
            <Badge variant="outline">+{permissions.length - 4} more</Badge>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const role = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <EditRoleDialog 
              role={role} 
              allPermissions={table.options.meta!.allPermissions}
              onRoleUpdated={table.options.meta!.refreshData}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit role</span>
              </DropdownMenuItem>
            </EditRoleDialog>
            <DeleteRoleDialog role={role} onRoleDeleted={table.options.meta!.refreshData}>
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete role
              </DropdownMenuItem>
            </DeleteRoleDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
