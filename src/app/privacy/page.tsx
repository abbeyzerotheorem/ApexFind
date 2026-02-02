'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              ApexFind ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. We comply with the **Nigeria Data Protection Regulation (NDPR)** and other relevant Nigerian data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">2. NDPR Compliance</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In accordance with the NDPR, we act as a Data Controller for the personal data we collect from you. We ensure that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Personal data is collected and processed fairly and for lawful purposes.</li>
              <li>Data is adequate, relevant, and limited to what is necessary.</li>
              <li>We take reasonable steps to ensure data is accurate and up to date.</li>
              <li>Data is kept in a form which permits identification of data subjects for no longer than is necessary.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">3. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>**Identity Data:** Name, username, and profile photo.</li>
              <li>**Contact Data:** Email address, phone number, and physical address.</li>
              <li>**Property Data:** Information about properties you list, view, or save.</li>
              <li>**Financial Data:** Payment details (processed securely via Nigerian payment gateways).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">4. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We prioritize the security of your data. While we use secure cloud infrastructure, we ensure that any data stored or transferred is handled with the highest level of encryption. We take appropriate technical and organizational measures to prevent unauthorized access, accidental loss, or destruction of your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under Nigerian law, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>The right to be informed about the collection and use of your data.</li>
              <li>The right to access your personal data.</li>
              <li>The right to rectify inaccurate or incomplete data.</li>
              <li>The right to request the erasure of your data ("the right to be forgotten").</li>
              <li>The right to object to or restrict processing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">6. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at **privacy@apexfind.ng**.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
