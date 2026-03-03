"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background pt-20">
            {/* Hero Section */}
            <section className="bg-primary/5 py-20 border-b border-primary/10">
                <div className="section-container text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Privacy <span className="text-primary">Policy</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-24">
                <div className="section-container max-w-4xl">
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">

                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-foreground">1. Who We Are</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Cohort provides curated coworking experiences, day passes, and community-based workspaces designed to help individuals and teams stay productive and connected.
                                This Privacy Policy applies to your use of our website, platform, and any communication you have with us through contact forms, bookings, or email.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-foreground">2. What Information We Collect</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We collect both personal and technical data to help us serve you better.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8 mt-4">
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold text-primary">a. Personal Information</h3>
                                    <p className="text-sm text-muted-foreground">When you register, contact us, or make a booking, we may collect:</p>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                                        <li>Name</li>
                                        <li>Email address</li>
                                        <li>Phone number</li>
                                        <li>Company or team name</li>
                                        <li>Booking or event details</li>
                                        <li>Payment information (processed securely)</li>
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold text-primary">b. Technical Information</h3>
                                    <p className="text-sm text-muted-foreground">When you browse our website, we may automatically collect:</p>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                                        <li>IP address</li>
                                        <li>Browser type and version</li>
                                        <li>Pages visited and referral URLs</li>
                                        <li>Device type and screen resolution</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <h3 className="text-xl font-semibold text-primary">c. Cookies & Analytics</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We use cookies and similar technologies to improve user experience, track how visitors use our website, and measure marketing campaign performance. You can manage your cookie preferences in your browser settings.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-foreground">3. How We Use Your Information</h2>
                            <p className="text-muted-foreground leading-relaxed">Your information is used to:</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                                <li>Process coworking space bookings and inquiries</li>
                                <li>Respond to your messages or requests</li>
                                <li>Send you booking confirmations and updates</li>
                                <li>Provide promotional content (only with your consent)</li>
                                <li>Analyze website performance and user behavior</li>
                                <li>Improve our services and offerings</li>
                            </ul>
                            <p className="text-primary font-medium mt-4">We do not sell or rent your personal data.</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-foreground">4. Sharing Your Information</h2>
                            <ul className="space-y-4 ml-4">
                                <li className="text-muted-foreground">
                                    <strong className="text-foreground">Service Providers:</strong> Such as web hosting platforms, email marketing tools, and analytics providers (e.g., Google Analytics, Stripe).
                                </li>
                                <li className="text-muted-foreground">
                                    <strong className="text-foreground">Legal Authorities:</strong> If required by law or to protect our rights.
                                </li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed italic">
                                All third parties are required to handle your information securely and in compliance with applicable data protection laws.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-foreground">5. Data Security</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We take appropriate technical and organizational measures to protect your personal data. Our website uses SSL encryption, and we only partner with secure third-party processors.
                                However, no internet transmission is 100% secure. Please use discretion when sharing sensitive data online.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-foreground">6. Updates to This Privacy Policy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may update this Privacy Policy from time to time to reflect changes in our services or legal obligations. Updates will be posted on this page with the new effective date.
                            </p>
                        </div>

                        <div className="p-8 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">7. Contact Us</h2>
                            <p className="text-muted-foreground">
                                If you have any questions or concerns about this Privacy Policy, please contact:
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm mt-4">
                                <div className="space-y-1">
                                    <p className="font-semibold text-foreground">Email</p>
                                    <p className="text-primary">info@cohortworks.com</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-foreground">Phone</p>
                                    <p className="text-primary">8688151905</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;




