"use client";
import { User } from "@/data/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination-custom";
import { Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UsersTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
    currentPage: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
}

export function UsersTable({
    users,
    onEdit,
    onDelete,
    currentPage,
    onPageChange,
    itemsPerPage
}: UsersTableProps) {
    const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="w-[250px]">User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedUsers.map((user) => (
                        <TableRow key={user._id || user.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground/70">
                                        {(user.name || "U").split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold">{user.mobile || user.contactNumber || "N/A"}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">{(user.mobile || user.contactNumber) ? "Mobile" : "No Contact"}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs font-medium italic text-primary/80">{user.organization || "Private Member"}</span>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="rounded-lg text-[10px] font-black uppercase tracking-wider">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' :
                                        user.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' :
                                            'bg-destructive/10 text-destructive'
                                        }`}
                                >
                                    {user.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs font-medium">
                                    {user.joinedDate
                                        ? (!isNaN(new Date(user.joinedDate).getTime())
                                            ? new Date(user.joinedDate).toLocaleDateString()
                                            : user.joinedDate)
                                        : "N/A"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs font-medium italic text-muted-foreground">
                                    {user.lastActive
                                        ? (!isNaN(new Date(user.lastActive).getTime())
                                            ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })
                                            : user.lastActive)
                                        : "Never"}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-lg text-primary hover:bg-primary hover:text-white transition-all duration-200" 
                                        onClick={() => onEdit(user)}
                                        title="Edit User"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200" 
                                        onClick={() => onDelete(user._id || user.id!)}
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {paginatedUsers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground italic font-medium">
                                No members detected in this selection.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <TablePagination
                totalItems={users.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}
