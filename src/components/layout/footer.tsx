
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/ApexFindlogo.png"
                alt="ApexFind Logo"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-xl font-bold">ApexFind</span>
            </div>
            <p className="text-muted-foreground">
              Your trusted partner in finding the perfect home in Nigeria.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Explore</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/search?type=buy" className="hover:text-foreground">For Sale</Link></li>
              <li><Link href="/search?type=rent" className="hover:text-foreground">For Rent</Link></li>
              <li><Link href="/agencies" className="hover:text-foreground">Agency Directory</Link></li>
              <li><Link href="/insights" className="hover:text-foreground">Market Insights</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/agents" className="hover:text-foreground">Find an Agent</Link></li>
              <li><Link href="/sell" className="hover:text-foreground">Sell Your Home</Link></li>
              <li><Link href="/mortgage" className="hover:text-foreground">Mortgage Calculator</Link></li>
              <li><Link href="/help" className="hover:text-foreground">Help Center / FAQ</Link></li>
              <li><Link href="/mobile" className="hover:text-foreground font-semibold text-primary">Download Mobile App</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/listing-terms" className="hover:text-foreground">Listing Terms</Link></li>
              <li><Link href="/refund-policy" className="hover:text-foreground">Refund Policy</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ApexFind. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
