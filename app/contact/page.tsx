import { ContactInfo } from "./contact-info";
import { ContactForm } from "./contact-form";

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-5xl mb-2">Contact Us</h1>
        <p className="text-muted-foreground">
          Any question or remarks? Just write us a message!
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <ContactInfo />
        <ContactForm />
      </div>
    </main>
  )
}
