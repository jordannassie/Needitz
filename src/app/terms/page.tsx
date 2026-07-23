import { Header } from "@/components/Header";

export const metadata = {
  title: "Terms of Service — Needitz",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="px-5 py-12">
        <div className="w-full max-w-lg mx-auto">
          <h1 className="text-[28px] font-black text-[#050505] mb-1">Terms of Service</h1>
          <p className="text-xs text-[#9A9DA5] mb-8">Last updated: July 2025</p>

          <p className="text-sm text-[#9A9DA5] bg-[#F7F7F7] rounded-xl px-4 py-3 mb-8">
            These terms are provided for informational purposes and should be reviewed by a qualified attorney before commercial use.
          </p>

          {[
            {
              title: "1. Acceptance of Terms",
              body: "By submitting a request through Needitz, you agree to these Terms of Service. If you do not agree, do not use this service.",
            },
            {
              title: "2. No Guarantee of Service",
              body: "Submitting a request does not guarantee that Needitz will source, supply, or deliver any item. Needitz may accept or decline any request at its sole discretion, for any reason, without obligation.",
            },
            {
              title: "3. No Guarantee of Pricing or Availability",
              body: "Any pricing, availability, lead time, or delivery information provided during or after the request process is preliminary and non-binding. Actual pricing and availability are subject to verification and may change.",
            },
            {
              title: "4. No Transaction Until Written Agreement",
              body: "No binding transaction, purchase order, or service agreement exists between you and Needitz until a separate written agreement is executed by both parties. These terms and your request submission do not constitute a contract for goods or services.",
            },
            {
              title: "5. Lawful Requests Only",
              body: "You agree to submit only requests for lawful goods and services. You must be legally authorized to purchase or receive the items you request. Requests for prohibited, regulated, or restricted goods—including but not limited to firearms, explosives, controlled substances, counterfeit goods, or sanctioned products—are strictly prohibited.",
            },
            {
              title: "6. Authorization",
              body: "By submitting a request, you represent and warrant that you are authorized to make the purchase or procurement inquiry described in your request.",
            },
            {
              title: "7. Third-Party Suppliers",
              body: "Needitz is not responsible for the acts or omissions of any third-party suppliers, manufacturers, or logistics providers unless and until Needitz has entered into a separate written agreement specifically accepting such responsibility.",
            },
            {
              title: "8. Limitation of Liability",
              body: "To the maximum extent permitted by law, Needitz shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use this service.",
            },
            {
              title: "9. Changes to Terms",
              body: "Needitz reserves the right to update these Terms at any time. Continued use of the service after changes constitutes acceptance of the revised Terms.",
            },
            {
              title: "10. Governing Law",
              body: "These Terms are governed by the laws of the jurisdiction in which Needitz operates, without regard to conflict of law principles.",
            },
          ].map((section) => (
            <section key={section.title} className="mb-6">
              <h2 className="text-base font-black text-[#050505] mb-2">{section.title}</h2>
              <p className="text-sm text-[#5E6168] leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
