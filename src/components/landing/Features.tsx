import { Building2, Calendar, Shield, Users, MapPin, Cog } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Premium Workspaces",
    description:
      "Access a curated selection of top-tier office spaces designed for productivity and collaboration." },
  {
    icon: Calendar,
    title: "Flexible Booking",
    description:
      "Book by the hour, day, or month. Our flexible plans adapt to your unique business needs." },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-grade security protocols ensure your data and physical spaces remain protected 24/7." },
  {
    icon: Cog,
    title: "Instant & Customizable Setup",
    description:
      "Get started in minutes. Customize your workspace as per your needs." },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Easily manage team access, permissions, and workspace allocations from one dashboard." },
  {
    icon: MapPin,
    title: "Prime Locations",
    description:
      "Strategic locations in major business districts with excellent transport links." },
];

const Features = () => {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Thrive</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our comprehensive platform provides all the tools and features you need
            to find, book, and manage your ideal workspace.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-elevated p-6 lg:p-8 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;





