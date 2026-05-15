import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-base-950 flex items-center justify-center px-5 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1600&q=80)", backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-aurora" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white text-lg">◈</div>
            <span className="text-white text-xl font-display font-semibold">Hidden Nepal</span>
          </a>
          <p className="text-white/35 text-sm mt-3">
            Sign in to save destinations, plan trips, and submit hidden gems
          </p>
        </div>

        {/* Clerk SignIn component */}
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white/[0.04] border border-white/[0.09] shadow-glass backdrop-blur-xl rounded-2xl",
              headerTitle: "text-white font-display",
              headerSubtitle: "text-white/40",
              socialButtonsBlockButton: "bg-white/[0.06] border border-white/[0.1] text-white/80 hover:bg-white/[0.1]",
              dividerLine: "bg-white/[0.08]",
              dividerText: "text-white/30",
              formFieldLabel: "text-white/50 text-xs font-mono uppercase tracking-wider",
              formFieldInput: "bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/20 rounded-xl",
              formButtonPrimary: "bg-brand-gradient text-white font-semibold rounded-xl shadow-brand",
              footerActionLink: "text-brand-400 hover:text-brand-300",
              identityPreviewText: "text-white/70",
              identityPreviewEditButton: "text-brand-400",
            },
          }}
        />
      </div>
    </div>
  );
}
