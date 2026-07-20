export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Contact</h1>
        <p className="mt-4 text-muted-foreground leading-7">
          Have questions about Tamer Studio? Reach out and our team will get back to you.
        </p>
        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-sm text-muted-foreground">support@tamer.studio</p>
          </div>
          <div>
            <label className="text-sm font-medium">Support</label>
            <p className="text-sm text-muted-foreground">Available Monday to Friday, 9am to 6pm ICT.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
