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
              Your trusted partner in finding the perfect home.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/search" className="hover:text-foreground">Search Homes</Link></li>
              <li><Link href="/agents" className="hover:text-foreground">Find an Agent</Link></li>
              <li><Link href="/sell" className="hover:text-foreground">Sell Your Home</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contact</h4>
            <p className="text-muted-foreground">
              123 Real Estate St.<br />
              Lagos, NG 100001<br />
              contact@apexfind.com
            </p>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ApexFind. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
