export interface Workspace {
    id?: number;
    _id?: string;
    name: string;
    location: string;
    floor?: string;
    type: string;
    capacity: string;
    amenities: string[];
    image: string;
    images?: string[];
    featured: boolean;
    price: number | string;
    description?: string;
    features?: {
        hasConferenceHall: boolean;
        hasCabin: boolean;
        workstationSeats?: number;
        conferenceHallSeats?: number;
        cabinSeats?: number;
    };
    allottedTo?: {
        _id: string;
        name: string;
        email: string;
    } | string | null;
    allotmentStart?: string;
    unavailableUntil?: string;
}

export const workspaces: Workspace[] = [
    {
        id: 1,
        name: "Dedicated Workspace #1",
        location: "Whitefields, Kondapur",
        floor: "1st Floor",
        type: "Dedicated Workspace",
        capacity: "20 people",
        amenities: ["High-speed WiFi", "Coffee Bar", "24/7 Access"],
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format",
        featured: true,
        price: 9999,
        description: "Experience premium coworking in the heart of Kondapur. Our dedicated workspaces are designed for teams that value consistency and professional growth. Each desk comes with ergonomic seating and secure storage.",
        features: {
            hasConferenceHall: true,
            hasCabin: true
        }
    },
    {
        id: 2,
        name: "Open Workstation",
        location: "Whitefields, Kondapur",
        floor: "2nd Floor",
        type: "Open WorkStation",
        capacity: "6-12 people",
        amenities: ["High-speed WiFi", "Coffee Bar", "Presentation Room"],
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&auto=format",
        featured: false,
        price: 5999,
        description: "Flexible seating for the modern professional. Join a vibrant community of creators and entrepreneurs in our open workstation area. Perfect for individuals who thrive in a dynamic, collaborative environment."
    },
    {
        id: 3,
        name: "Executive Meeting Room",
        location: "JBS Parade Ground",
        floor: "1st Floor",
        type: "Board Room",
        capacity: "12 people",
        amenities: ["High-speed WiFi", "Coffee Bar", "Smart Board"],
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format",
        featured: false,
        price: 799,
        description: "Host your high-stakes meetings in a professional environment. Our executive meeting rooms are equipped with state-of-the-art presentation technology and comfortable seating for up to 12 people."
    },
    {
        id: 4,
        name: "Grand Event Space",
        location: "Whitefields, Kondapur",
        floor: "4th Floor",
        type: "Event Space",
        capacity: "100-120 people",
        amenities: ["AV Equipment", "Catering Available", "Parking"],
        image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&auto=format",
        featured: false,
        price: 50000,
        description: "From workshops to product launches, our grand event space offers the versatility and scale you need. Featuring premium AV systems and optional catering services."
    },
    {
        id: 5,
        name: "Private Suite",
        location: "JBS Parade Ground",
        floor: "5th Floor",
        type: "Dedicated Workspace",
        capacity: "4 people",
        amenities: ["Private Entry", "WiFi", "Printer Access"],
        image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format",
        featured: true,
        price: 24999,
        description: "Exclusive office suites for small teams. Enjoy the benefits of a coworking community while maintaining your team's privacy and brand identity. Includes dedicated printer access and private entry.",
        features: {
            hasConferenceHall: false,
            hasCabin: true
        }
    },
    {
        id: 6,
        name: "Creative Studio",
        location: "Whitefields, Kondapur",
        type: "Open Workspace",
        capacity: "8 people",
        amenities: ["Natural Light", "Studio Backgrounds", "Coffee"],
        image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format",
        featured: false,
        price: 12999,
        description: "A bright, airy space designed for photographers, videographers, and content creators. Equipped with various backgrounds and ample natural light to bring your creative vision to life."
    }
];
