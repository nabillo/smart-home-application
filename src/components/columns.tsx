"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types"
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
import { DeleteUserDialog } from "./DeleteUserDialog"
import { EditUserDialog } from "./EditUserDialog"

// Augment the table meta to include our refresh function
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    refreshUsers: () => void
  }
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "role_name",
    header: "Role",
    cell: ({ row }) => {
      const roleName = row.original.role_name;
      if (!roleName) {
        return <span className="text-muted-foreground">Not Assigned</span>
      }
      const variant = roleName.toLowerCase() === 'admin' ? 'default' : 'secondary';
      return <Badge variant={variant}>{roleName}</Badge>
    }
  },
  {
    accessorKey: "created_at",
    header: "Date Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      const formatted = date.toLocaleDateString()
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original
 
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.user_id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <EditUserDialog user={user} onUserUpdated={table.options.meta!.refreshUsers}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit user</span>
              </DropdownMenuItem>
            </EditUserDialog>
            <DeleteUserDialog user={user} onUserDeleted={table.options.meta!.refreshUsers}>
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete user
              </DropdownMenuItem>
            </DeleteUserDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
