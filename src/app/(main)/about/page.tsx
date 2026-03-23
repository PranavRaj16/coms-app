"use client";
import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-office.jpg";
import raidurgamOffice from "@/assets/raidurgam-office.jpg";

const About = () => {
    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={heroImage.src}
                        alt="Cohort Coworking Space"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                </div>
                <div className="relative text-center px-4 animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                        ABOUT <span className="text-primary">US</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed">
                        "Our network has fostered a thriving community of professionals and businesses!"
                    </p>
                </div>
            </section>

            {/* Tagline Section */}
            <section className="bg-primary/5 py-12 border-y border-primary/10">
                <div className="section-container text-center">
                    <h2 className="text-2xl md:text-4xl font-bold text-primary tracking-widest uppercase animate-pulse">
                        "WE ARE THE LARGEST COWORKING IN METRO"
                    </h2>
                </div>
            </section>

            <main className="section-container py-20 space-y-32">

                {/* Section 1: Business Focus */}
                <section className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
                            Our Philosophy
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                            WE HELP BUSINESSES FIND THE RIGHT WAY TO WORK
                        </h2>
                        <div className="w-20 h-1 bg-primary rounded-full" />
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            We believe that work thrives better when community people come together. Our space isn't just about desks and meeting rooms — it's about creating a supportive community that fosters creativity, collaboration, and growth.
                        </p>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Whether you're a freelancer, entrepreneur or part of a small team, our coworking environment is designed to help you thrive.
                        </p>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden shadow-soft-lg group animate-fade-in">
                        <img
                            src="https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?q=80&w=2070&auto=format&fit=crop"
                            alt="Collaborative Workspace"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                </section>

                {/* Section 2: Work Your Way */}
                <section className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="relative rounded-2xl overflow-hidden shadow-soft-lg group order-2 md:order-1 animate-fade-in">
                        <img
                            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop"
                            alt="Modern Workspace"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                    <div className="space-y-6 order-1 md:order-2 animate-fade-in-up">
                        <div className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-2">
                            Flexibility
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                            WORK YOUR WAY
                        </h2>
                        <div className="w-20 h-1 bg-accent rounded-full" />
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Enjoy from an attractive, comfy, and functional workspace, a reception area, meeting rooms, concierge-level services and more. Cohort has everything you need and more for you to work at your best pace.
                        </p>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Choose whether you want to work in a quiet space of focus or in a more collaborative space with shared tables and encouraged interaction. Explore now for Coworking space in Hyderabad.
                        </p>
                    </div>
                </section>

                {/* Section 3: Prime Locations */}
                <section className="space-y-16">
                    <div className="text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#b8860b] inline-block relative border-b-2 border-[#b8860b] pb-4 px-8 mb-8">
                            Our Prime Location
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Location Card 1: Kondapur */}
                        <div className="flex flex-col justify-between bg-white p-6 rounded-2xl shadow-sm space-y-6 animate-fade-in border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-foreground">
                                    Whitefields, Kondapur
                                </h3>
                                <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                                    <p>
                                        Strategically located in Hyderabad's bustling IT corridor, our Kondapur center caters to tech startups, IT professionals and freelancers.
                                    </p>
                                    <p>
                                        Perfect for companies looking to connect with like-minded professionals in a rapidly growing commercial hub.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative h-[200px] rounded-xl overflow-hidden shadow-sm">
                                    <img
                                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                                        alt="Kondapur Office Interior"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                    <iframe
                                        width="100%"
                                        height="200"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src="https://www.google.com/maps?q=Cohort%20Coworking%20Kondapur%20Hyderabad%202/91/20,%20BP%20Raju%20Marg,%20Laxmi%20Cyber%20City,%20Whitefields,%20Kondapur,%20Telangana-500081&output=embed"
                                    ></iframe>
                                </div>
                            </div>
                        </div>

                        {/* Location Card 2: Raidurgam */}
                        <div className="flex flex-col justify-between bg-white p-6 rounded-2xl shadow-sm space-y-6 animate-fade-in border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-foreground">
                                        Techno 1, Raidurgam
                                    </h3>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">New</span>
                                </div>
                                <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                                    <p>
                                        Located in the Techno 1 building at the Khajaguda X Road, this center offers premium workspace solutions in the rapidly developing Raidurgam tech zone.
                                    </p>
                                    <p>
                                        Techno-1, X Road, Radhe Nagar, Khajaguda, Rai Durg, Hyderabad, Telangana 500104.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative h-[200px] rounded-xl overflow-hidden shadow-sm">
                                    <img
                                        src={raidurgamOffice.src}
                                        alt="Raidurgam Office Interior"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                    <iframe
                                        width="100%"
                                        height="200"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.774913504381!2d78.38037761744384!3d17.422586388147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93d2071d6675%3A0x3c93cee6d59e731d!2sCOHORT%20Coworking%20%40%20Techno%201%20Raidurgam!5e0!3m2!1sen!2sin!4v1711189044952!5m2!1sen!2sin"
                                    ></iframe>
                                </div>
                            </div>
                        </div>

                        {/* Location Card 3: Secunderabad */}
                        <div className="flex flex-col justify-between bg-white p-6 rounded-2xl shadow-sm space-y-6 animate-fade-in border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-foreground">
                                    JBS Parade Ground
                                </h3>
                                <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                                    <p>
                                        Situated at the JBS metro station, this center offers unparalleled connectivity for teams crossing the twin cities.
                                    </p>
                                    <p>
                                        State-of-the-art facilities with the convenience of being directly integrated into the Hyderabad Metro network.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative h-[200px] rounded-xl overflow-hidden shadow-sm">
                                    <img
                                        src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
                                        alt="Secunderabad Office Interior"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                    <iframe
                                        width="100%"
                                        height="200"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src="https://www.google.com/maps?q=Cohort%20Coworking%20Gandhi%20Nagar,%20Nehru%20Nagar%20Colony,%20West%20Marredpally,%20Secunderabad,%20Telangana-500003&output=embed"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
};

export default About;




