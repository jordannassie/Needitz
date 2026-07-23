import { Header } from "@/components/Header";

export const metadata = {
  title: "Privacy Policy — NeedItz",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="px-5 py-12">
        <div className="w-full max-w-lg mx-auto prose prose-sm max-w-none">
          <h1 className="text-[28px] font-black text-[#050505] mb-1">Privacy Policy</h1>
          <p className="text-xs text-[#9A9DA5] mb-8">Last updated: July 2025</p>

          <p className="text-sm text-[#9A9DA5] bg-[#F7F7F7] rounded-xl px-4 py-3 mb-8">
            This policy is provided for informational purposes and should be reviewed by a qualified attorney before commercial use.
          </p>

          {[
            {
              title: "1. Information We Collect",
              body: "When you submit a request, we collect the information you provide including your name, email address, phone number, company name (if provided), item description, budget, deadline, and delivery location. We also collect standard usage data such as IP address, browser type, and referring URL.",
            },
            {
              title: "2. How We Use Your Information",
              body: "We use your information to review your request, contact you if we believe we can help, and improve our service. We do not sell your personal information to third parties.",
            },
            {
              title: "3. Information Sharing",
              body: "We may share your information with trusted service providers who help us operate our platform (such as email delivery services and database providers) under strict confidentiality obligations. We do not share your information with suppliers without your explicit consent.",
            },
            {
              title: "4. Data Retention",
              body: "We retain your submitted information for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required by law.",
            },
            {
              title: "5. Security",
              body: "We implement reasonable technical and organizational measures to protect your personal information against unauthorized access, loss, or misuse. However, no transmission over the internet is completely secure.",
            },
            {
              title: "6. Your Rights",
              body: "Depending on your jurisdiction, you may have rights to access, correct, or delete the personal information we hold about you. To exercise these rights, please contact us through the contact page.",
            },
            {
              title: "7. Cookies and Analytics",
              body: "We may use cookies and third-party analytics tools (such as Google Analytics) to understand how visitors use our site. You can disable cookies in your browser settings.",
            },
            {
              title: "8. Changes to This Policy",
              body: "We may update this Privacy Policy from time to time. We will post the updated policy on this page with a revised date.",
            },
            {
              title: "9. Contact",
              body: "If you have questions about this Privacy Policy, please reach out through our contact page.",
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
