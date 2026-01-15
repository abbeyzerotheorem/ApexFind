import { Button } from "@/components/ui/button";
import { Github, Linkedin, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  "Real Estate": ["Browse all homes", "Lagos real estate", "Abuja real estate", "Port Harcourt real estate", "Ibadan real estate"],
  "Rentals": ["Rental Buildings", "Lagos apartments for rent", "Abuja apartments for rent", "Port Harcourt apartments for rent", "Ibadan apartments for rent"],
  "Mortgage": ["Mortgage rates", "Get pre-approved", "Mortgage calculator", "Refinance calculator", "Lenders"],
  "Browsing": ["Neighborhoods", "Cities", "States", "Areas", "Counties"],
};

export default function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <h3 className="text-2xl font-bold">ApexFind</h3>
            <p className="text-muted-foreground">
              Your destination for finding the perfect place to call home.
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Github />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Linkedin />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Youtube />
              </Link>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-md font-semibold tracking-wider text-foreground">
                  {category}
                </h4>
                <ul className="mt-4 space-y-4">
                  {links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-base font-normal text-muted-foreground hover:text-foreground"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 border-t border-border pt-8 sm:flex sm:items-center sm:justify-between">
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Cookie Policy</Link>
            <Link href="#">Accessibility</Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground sm:mt-0">
            &copy; {new Date().getFullYear()} ApexFind, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
