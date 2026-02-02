'use client';

export default function ListingTermsPage() {
  return (
    <div className="bg-background min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Property Listing Terms</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">1. Accuracy of Responsibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              As a listing agent or property owner, you are solely responsible for the accuracy and completeness of the property information you provide. This includes price, location, size, and amenities. Listings found to be deliberately misleading will be removed immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">2. Document Authenticity</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By listing a property, you represent that you have the legal right to sell or rent the property. You may be required to provide copies of:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Certificate of Occupancy (C of O)</li>
              <li>Governor's Consent</li>
              <li>Registered Deed of Assignment</li>
              <li>Approved Building Plan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">3. Anti-Fraud Clause</h2>
            <p className="text-muted-foreground leading-relaxed">
              ApexFind has a zero-tolerance policy for fraud. We cooperate fully with the **Economic and Financial Crimes Commission (EFCC)** and the Nigerian Police Force to investigate and prosecute any fraudulent activities initiated on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">4. Image Guidelines</h2>
            <p className="text-muted-foreground leading-relaxed">
              Images must be of the actual property being listed. Use of "stock photos" or images from other listings without permission is prohibited. ApexFind reserves the right to watermark images uploaded to our platform to prevent unauthorized reuse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">5. Listing Duration & Fees</h2>
            <p className="text-muted-foreground leading-relaxed">
              Free listings are available for a limited duration. Featured and Premium listings are subject to fees as outlined in our Pricing Schedule. Fees are non-refundable once a listing has been promoted.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
