export const metadata = {
  title: "Terms of Service - Tamer Studio",
  description: "Terms of service for Tamer Studio.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-7">
          By using Tamer Studio, you agree to these terms. Please read them carefully.
        </p>
        <p className="mt-4 text-sm text-muted-foreground leading-7">
          You are responsible for the content you generate and the AI providers you connect. Tamer Studio is a production operating system and does not guarantee specific outcomes from AI models.
        </p>
      </div>
    </div>
  );
}
