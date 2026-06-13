import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card border border-border rounded-2xl shadow-xl",
            headerTitle: "text-foreground text-2xl",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton:
              "bg-surface border border-border text-foreground hover:bg-surface-hover rounded-xl",
            formButtonPrimary:
              "bg-accent hover:bg-accent-hover text-accent-foreground rounded-xl",
            formFieldInput:
              "bg-surface border border-border text-foreground rounded-xl focus:border-accent",
            formFieldLabel: "text-muted-foreground",
            footerActionText: "text-muted-foreground",
            footerActionLink: "text-accent hover:text-accent-hover",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground",
          },
        }}
        signInUrl="/sign-in"
      />
    </div>
  );
}
