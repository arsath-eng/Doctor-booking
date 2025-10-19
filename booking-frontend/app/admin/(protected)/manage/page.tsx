"use client";

// --- FIX: Import useCallback ---
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface Admin {
  id: number;
  username: string;
}

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

export default function ManageAdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // --- FIX: Define fetchAdmins at the top level, wrapped in useCallback ---
  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch('http://127.0.0.1:8000/admin/list-admins', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch admins.");
        const data = await response.json();
        setAdmins(data);
    } catch(error: unknown) {
        toast.error("Error", {description: getErrorMessage(error)});
    } finally {
        setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'superadmin') {
        toast.error("Access Denied", { description: "You do not have permission to view this page."});
        router.push('/admin/dashboard');
        return;
    }
    // --- FIX: Call the top-level function ---
    fetchAdmins();
  }, [router, fetchAdmins]); // Add fetchAdmins to the dependency array

  const handleCreateAdmin = async () => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch('http://127.0.0.1:8000/admin/create-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({ username: newUsername, password: newPassword })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to create admin.");
        }
        toast.success("Admin created successfully.");
        setNewUsername("");
        setNewPassword("");
        setIsDialogOpen(false);
        await fetchAdmins(); // This now correctly calls the function
    } catch(error: unknown) {
        toast.error("Creation Failed", {description: getErrorMessage(error)});
    }
  };

  const handleDelete = async (adminId: number) => {
    if (confirm('Are you sure you want to delete this admin?')) {
      const token = localStorage.getItem('authToken');
      try {
          const response = await fetch(`http://127.0.0.1:8000/admin/delete-admin/${adminId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error("Failed to delete admin.");
          toast.success("Admin deleted successfully.");
          await fetchAdmins(); // This now correctly calls the function
      } catch(error: unknown) {
          toast.error("Deletion Failed", {description: getErrorMessage(error)});
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Admins</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Admin</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Admin</DialogTitle>
                    <DialogDescription>Fill in the details for the new administrator.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">Username</Label>
                        <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <Input id="password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreateAdmin}>Create Admin</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing Administrators</CardTitle>
          <CardDescription>List of all registered admin users.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={2}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                    ) : admins.length > 0 ? (
                        admins.map(admin => (
                            <TableRow key={admin.id}>
                                <TableCell className="font-medium">{admin.username}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(admin.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={2} className="text-center h-24">No admins found.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}