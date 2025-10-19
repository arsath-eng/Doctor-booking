import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="container">
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold">Your Health, Our Priority</h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Welcome to Maryam Medicare, your trusted partner in healthcare. Book appointments seamlessly and manage your health journey with ease.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/booking">Book an Appointment Now</Link>
        </Button>
      </section>
      {/* Add other sections like "About Our Clinic" and "Meet Our Doctors" using Card components */}
    </div>
  );
}