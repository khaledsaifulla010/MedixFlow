"use client";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
} from "@/services/usersApi";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {  Loader, Loader2, Trash2 } from "lucide-react";

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
function RoleBadge({ role }: { role: string }) {
  const base =
    "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold";
  const cls =
    role === "admin"
      ? "bg-purple-100 text-purple-800"
      : role === "doctor"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  return <span className={`${base} ${cls}`}>{formatRole(role)}</span>;
}

export default function AllUsersDetails() {
  const { data, isLoading, isError, error, refetch } = useGetAllUsersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        Loading Users
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-3 text-center">
        <div className="text-red-600 text-sm">Failed to Load Users.</div>
        <button
          onClick={() => refetch()}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Retry
        </button>
        <pre className="text-xs text-gray-400 overflow-auto max-w-full">
          {String((error as any)?.data || (error as any)?.message || error)}
        </pre>
      </div>
    );
  }

  const users = data ?? [];
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  const handleConfirmDelete = async () => {
    if (!pendingId) return;
    try {
      await deleteUser(pendingId).unwrap();
      toast.success("User Deleted Successfully");
      setPendingId(null);
    } catch (e) {
      console.error("Delete failed:", e);
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className=" ">
      <div className="mb-4 text-center">
        <p className="text-xl font-bold text-end mr-4 -mb-2">
          Total Users : <span className="font-medium">{users.length}</span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border-2">
        <Table className="min-w-full text-center">
          <TableHeader>
            <TableRow className="text-base">
              <TableHead className="text-center w-20 font-bold">
                SL/No.
              </TableHead>
              <TableHead className="text-center font-bold">Name</TableHead>
              <TableHead className="text-center font-bold">Email</TableHead>
              <TableHead className="text-center font-bold">Phone</TableHead>
              <TableHead className="text-center font-bold">
                Date of Birth
              </TableHead>
              <TableHead className="text-center font-bold">Role</TableHead>
              <TableHead className="text-center font-bold">Joined</TableHead>
              <TableHead className="text-center font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u, idx) => (
              <TableRow key={u.id} className="text-sm">
                <TableCell className="text-center font-medium">
                  {idx + 1}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {u.name}
                </TableCell>
                <TableCell className="text-center">{u.email}</TableCell>
                <TableCell className="text-center">{u.phone}</TableCell>
                <TableCell className="text-center">{fmt(u.dob)}</TableCell>
                <TableCell className="text-center">
                  <RoleBadge role={u.role} />
                </TableCell>
                <TableCell className="text-center">
                  {fmt(u.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  {u.role === "admin" ? (
                    <Button variant="secondary" disabled>
                      <Trash2 />
                    </Button>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => setPendingId(u.id)}
                          disabled={isDeleting && pendingId === u.id}
                        >
                          {isDeleting && pendingId === u.id ? (
                            <Loader />
                          ) : (
                            <Trash2 />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="text-center">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete this user and
                            related records.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="sm:justify-center">
                          <AlertDialogCancel
                            onClick={() => setPendingId(null)}
                            className="mx-2 cursor-pointer"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="mx-2 bg-red-600 hover:bg-red-600/90 text-white cursor-pointer"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
