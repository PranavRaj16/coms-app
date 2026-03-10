"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function TablePagination({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
    className,
}: TablePaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    return (
        <div className={cn("flex items-center justify-between px-6 py-4 border-t border-border/50", className)}>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                                    currentPage === pageNum 
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                        : "border-border/50 hover:bg-primary/5 hover:text-primary"
                                )}
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
