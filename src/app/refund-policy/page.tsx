'use client';

export default function RefundPolicyPage() {
  return (
    <div className="bg-background min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">1. Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our refund policy covers payments made directly to ApexFind for service fees, listing promotions, and featured placements. Please note that ApexFind is **not** responsible for refunds regarding property sales or rentals, as those transactions occur between users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">2. Naira (₦) Refunds Only</h2>
            <p className="text-muted-foreground leading-relaxed">
              All payments and refunds on ApexFind are processed in **Nigerian Naira (₦)**. If you paid via a foreign-denominated card, the refund amount will be the exact Naira value we received, and your bank may apply its own conversion rates for the credit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">3. Eligible Refunds</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Refunds may be issued in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Duplicate payments for the same service.</li>
              <li>Technical errors where a paid promotion was not activated.</li>
              <li>Unauthorized transactions reported within 24 hours.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">4. Processing Time (Nigerian Banks)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Once a refund is approved, it typically takes **5 to 10 business days** to appear in your bank account. This timeline is subject to the processing speeds of the relevant Nigerian commercial banks and our payment gateway partners (e.g., Paystack or Flutterwave).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">5. Charges Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              In certain refund cases, a transaction processing fee (typically 1.5% - 2.5% as charged by the payment gateway) may be deducted from the final refund amount.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">6. How to Request a Refund</h2>
            <p className="text-muted-foreground leading-relaxed">
              To request a refund, please email **billing@apexfind.ng** with your transaction reference, date of payment, and the reason for your request.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
