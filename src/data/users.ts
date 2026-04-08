export interface User {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    mobile?: string;
    contactNumber?: string;
    organization?: string;
    role: "Admin" | "Member" | "Manager" | "Authenticator";
    status: "Active" | "Inactive" | "Pending";
    joinedDate: string;
    lastActive: string;
    includeGST?: boolean;
    includeCarParking?: boolean;
    carParkingSlots?: number;
    carParkingPricePerSlot?: number;
}

export const users: User[] = [
    {
        id: "1",
        name: "Pranav Raj",
        email: "pranav@cohort.com",
        role: "Admin",
        status: "Active",
        joinedDate: "2024-01-15",
        lastActive: "Today",
    },
    {
        id: "2",
        name: "Amit Sharma",
        email: "amit@startup.co",
        role: "Member",
        status: "Active",
        joinedDate: "2024-02-10",
        lastActive: "2 hours ago",
    },
    {
        id: "3",
        name: "Sneha Reddy",
        email: "sneha@designhub.in",
        role: "Member",
        status: "Inactive",
        joinedDate: "2023-11-20",
        lastActive: "5 days ago",
    },
    {
        id: "4",
        name: "Vikram Malhotra",
        email: "vikram@enterprise.com",
        role: "Manager",
        status: "Active",
        joinedDate: "2024-03-01",
        lastActive: "10 mins ago",
    },
    {
        id: "5",
        name: "Ananya Iyer",
        email: "ananya@freelance.org",
        role: "Member",
        status: "Pending",
        joinedDate: "2024-03-05",
        lastActive: "Never",
    },
    {
        id: "6",
        name: "Rahul Verma",
        email: "rahul@techies.com",
        role: "Member",
        status: "Active",
        joinedDate: "2024-01-20",
        lastActive: "1 day ago",
    },
];
