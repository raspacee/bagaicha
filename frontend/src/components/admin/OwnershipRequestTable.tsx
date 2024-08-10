import {
  useGetRequestOwnership,
  useGrantRequestOwnership,
} from "@/api/OwnershipApi";
import { OwnershipRequest } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { OwnershipRequestDataTable } from "./OwnershipRequestDataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { DateTime } from "luxon";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const columns: ColumnDef<OwnershipRequest>[] = [
  {
    accessorKey: "requestedBy",
    header: "Requested By",
  },
  {
    accessorKey: "placeId",
    header: "Place ID",
  },
  {
    accessorKey: "requestedDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className=""
        >
          Requested On
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = DateTime.fromISO(row.getValue("requestedDate")).toFormat(
        "MMM d, yyyy h:mm a"
      );
      return <div className="ml-2">{date}</div>;
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = DateTime.fromISO(rowA.getValue(columnId));
      const dateB = DateTime.fromISO(rowB.getValue(columnId));

      return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
    },
  },
  {
    accessorKey: "documentImageUrl",
    header: "Document URL",
    cell: ({ row }) => (
      <Link to={row.original.documentImageUrl} target="_blank">
        Open Image
      </Link>
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const ownershipRequest = row.original;
      const { grantOwnership } = useGrantRequestOwnership(row.original.placeId);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                toast.info("Granting request...");
                grantOwnership(ownershipRequest.id);
              }}
            >
              Grant Request
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Delete Request</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const OwnershipRequestTable = () => {
  const { ownershipRequests, isLoading } = useGetRequestOwnership();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (ownershipRequests == null) {
    return <h1>Ownership Requests not found</h1>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">
        Ownership Requests
      </h1>
      <OwnershipRequestDataTable columns={columns} data={ownershipRequests} />
    </div>
  );
};

export default OwnershipRequestTable;
