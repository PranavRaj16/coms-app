"use client";
import { User } from "@/data/users";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination-custom";
import { formatDistanceToNow } from "date-fns";

interface RecentUsersTableProps {
    users: User[];
    currentPage: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
}

export function RecentUsersTable({
    users,
    currentPage,
    onPageChange,
    itemsPerPage
}: RecentUsersTableProps) {
    const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return (
        <div className="card-elevated overflow-hidden glass shadow-soft">
            <div className="p-6 border-b border-border/50">
                <h3 className="text-lg font-black italic tracking-tight">Recent Members</h3>
            </div>
            <Table>
                <TableHeader className="bg-muted/30 text-[10px] font-black uppercase tracking-widest">
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedUsers.map((user) => (
                        <TableRow key={user._id || user.id} className="hover:bg-muted/20 border-none transition-colors">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">
                                        {(user.name || "U").split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-xs">{user.name}</span>
                                        <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{user.role}</span>
                            </TableCell>
                            <TableCell className="text-[10px] font-medium text-muted-foreground italic">
                                {user.joinedDate ? (!isNaN(new Date(user.joinedDate).getTime()) ? formatDistanceToNow(new Date(user.joinedDate), { addSuffix: true }) : user.joinedDate) : "N/A"}
                            </TableCell>
                        </TableRow>
                    ))}
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
