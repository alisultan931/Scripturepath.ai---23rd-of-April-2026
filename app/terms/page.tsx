import { Navigation } from "@/components/ui/particle-effect-for-hero";
import Footer from "@/components/ui/footer";
import { BookOpen } from "lucide-react";

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By accessing or using ScripturePath, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.",
  },
  {
    title: "Description of Service",
    body: "ScripturePath is an AI-assisted scripture study platform designed to help pastors, teachers, scholars, and students explore sacred texts. The service generates structured study guides based on passages you provide. Scripture text is never altered.",
  },
  {
    title: "User Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate information when creating an account and keep it up to date.",
  },
  {
    title: "Acceptable Use",
    body: "You agree not to misuse ScripturePath. This includes attempting to reverse-engineer the service, using it to generate content that is harmful or deceptive, or violating any applicable laws. We reserve the right to suspend accounts that violate these terms.",
  },
  {
    title: "Credits & Subscriptions",
    body: "Free accounts receive a limited number of study generation credits. Premium subscriptions provide expanded access. All purchases are final. Subscription cancellations take effect at the end of the current billing period.",
  },
  {
    title: "Intellectual Property",
    body: "ScripturePath and its original content, features, and functionality are owned by StellaFlo. Study outputs generated through the platform are yours to use for personal and ministry purposes. You may not resell or redistribute outputs as a standalone product.",
  },
  {
    title: "Disclaimer of Warranties",
    body: "ScripturePath is provided \"as is\" without warranties of any kind. While we strive for accuracy and theological integrity, AI-generated study content should be reviewed by qualified individuals before use in teaching or preaching contexts.",
  },
  {
    title: "Limitation of Liability",
    body: "To the fullest extent permitted by law, StellaFlo shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.",
  },
  {
    title: "Changes to Terms",
    body: "We may update these terms from time to time. Continued use of ScripturePath after changes are posted constitutes your acceptance of the revised terms. We will make reasonable efforts to notify users of significant changes.",
  },
  {
    title: "Contact",
    body: "If you have questions about these Terms, please reach out through our contact page.",
  },
];

export default function TermsPage() {
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
            <BookOpen className="h-5 w-5 text-black" strokeWidth={2.5} />
          </div>
          <p
            className="mb-3 text-xs font-mono uppercase tracking-widest"
            style={{ color: "#D6A85F" }}
          >
            Legal
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Terms of Service
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
