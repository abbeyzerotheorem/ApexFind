'use client';

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-background min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using ApexFind, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our platform. These terms are governed by the laws of the **Federal Republic of Nigeria**.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">2. Nigerian Jurisdiction & Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach, termination, or invalidity thereof, shall be settled by arbitration in accordance with the **Arbitration and Conciliation Act** of Nigeria. The place of arbitration shall be Lagos, Nigeria, and the language of the proceedings shall be English.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">3. Agency Regulations Compliance</h2>
            <p className="text-muted-foreground leading-relaxed">
              All real estate agents and agencies using ApexFind must be duly registered and compliant with the regulations set by the **Estate Surveyors and Valuers Registration Board of Nigeria (ESVARBON)** and the **Lagos State Real Estate Regulatory Authority (LASRERA)** where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">4. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Users are prohibited from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Posting fraudulent or misleading property information.</li>
              <li>Impersonating any person or entity, including verified agents.</li>
              <li>Engaging in any form of money laundering or financial crimes.</li>
              <li>Collecting user information for unauthorized marketing purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">5. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              ApexFind serves as a marketplace connecting buyers and sellers. We do not own the properties listed and are not liable for any losses incurred during transactions between users. We strongly advise all users to conduct independent physical inspections and legal verification of documents at relevant state land registries.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on the platform, including logos, text, and software, is the property of ApexFind or its content suppliers and is protected by Nigerian and international copyright laws.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
