import { Navigation } from "@/components/ui/particle-effect-for-hero";
import Footer from "@/components/ui/footer";
import { ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Information We Collect",
    body: "When you create an account, we collect your name and email address. When you use the study generation feature, we process the scripture passages and prompts you submit. We do not collect payment card details directly — payments are handled securely by Stripe.",
  },
  {
    title: "How We Use Your Information",
    body: "We use your information to operate and improve ScripturePath, authenticate your account, process your subscription, and send you important service updates. We do not sell your personal information to third parties.",
  },
  {
    title: "Study Data",
    body: "Study inputs and outputs are stored to provide you with a history of your work and to improve the quality of the service. You can delete your studies at any time from your dashboard. We do not use your study content to train external AI models.",
  },
  {
    title: "Cookies & Analytics",
    body: "We use essential cookies to keep you logged in and maintain session state. We may use privacy-respecting analytics tools to understand how the product is used in aggregate. We do not use advertising or tracking cookies.",
  },
  {
    title: "Data Sharing",
    body: "We share your data only with trusted service providers necessary to run the platform — including Supabase (database and auth), Stripe (payments), and Anthropic (AI processing). Each provider is bound by their own privacy obligations.",
  },
  {
    title: "Data Retention",
    body: "We retain your account data for as long as your account is active. If you delete your account, your personal data and study history will be permanently removed within 30 days.",
  },
  {
    title: "Security",
    body: "We take reasonable technical and organizational measures to protect your information. All data is transmitted over HTTPS. Passwords are never stored — we use secure, token-based authentication via Supabase.",
  },
  {
    title: "Your Rights",
    body: "You have the right to access, correct, or delete your personal data at any time. To make a request, contact us through our contact page and we will respond within 30 days.",
  },
  {
    title: "Children's Privacy",
    body: "ScripturePath is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their data, please contact us immediately.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy as the service evolves. We will notify you of significant changes via email or an in-app notice. Continued use of the service after changes are posted constitutes acceptance.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-16">
        <Navigation showNavLinks={false} />
      </div>

      <main className="mx-auto max-w-3xl px-6 py-20">
        {/* Header */}
        <div className="mb-16 text-center">
          <div
            className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, #D6A85F 0%, #a87c3a 100%)",
              boxShadow: "0 0 24px rgba(214,168,95,0.3)",
            }}
          >
            <ShieldCheck className="h-5 w-5 text-black" strokeWidth={2.5} />
          </div>
          <p
            className="mb-3 text-xs font-mono uppercase tracking-widest"
            style={{ color: "#D6A85F" }}
          >
            Legal
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-white/40">
            Last updated: April 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i} className="border-t border-white/10 pt-10">
              <h2 className="mb-3 text-lg font-semibold text-white">
                {i + 1}. {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-white/60">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
