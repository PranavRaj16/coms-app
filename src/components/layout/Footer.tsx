import Link from "next/link";
import cohortimage from "@/assets/cohort-logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground py-16">
      <div className="section-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="font-semibold text-lg text-primary-foreground">
                <img src={cohortimage.src} alt="Logo" className="w-40 rounded-full" />
              </span>
            </Link>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Discover and manage premium office spaces effortlessly. Your perfect workspace awaits.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-primary-foreground font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {[{ name: "Browse Workspaces", link: "/workspaces" }, { name: "Pricing", link: "/pricing" }, { name: "Enterprise", link: "/enterprise" }, { name: "Integrations", link: "/integrations" }].map((item) => (
                <li key={item.name}>
                  <Link href={item.link}
                    className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-primary-foreground font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {[{ name: "About Us", link: "/about" }, { name: "Careers", link: "/careers" }, { name: "Blog", link: "/blog" }, { name: "Press", link: "/press" }].map((item) => (
                <li key={item.name}>
                  <Link href={item.link}
                    className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-primary-foreground font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {[{ name: "Help Center", link: "/help-center" }, { name: "Contact", link: "/contact" }, { name: "Privacy Policy", link: "/privacy-policy" }, { name: "Terms of Service", link: "/terms-of-service" }].map((item) => (
                <li key={item.name}>
                  <Link href={item.link}
                    className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © 2026 Cohort Office Management. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {[{ name: "Facebook", link: "https://www.facebook.com/people/CohortCoworking-Space/61565557434295/" }, { name: "LinkedIn", link: "https://www.linkedin.com/in/cohort-coworking-649b22333/" }, { name: "Instagram", link: "https://www.instagram.com/cohort.coworking" }].map((social) => (
              <a
                key={social.name}
                href={social.link}
                className="text-primary-foreground/50 hover:text-primary-foreground transition-colors text-sm"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;





