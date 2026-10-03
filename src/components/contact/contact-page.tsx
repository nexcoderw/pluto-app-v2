import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Compass,
  MapPin,
  MessageCircle,
  MoveUpRight,
  Ticket,
} from "lucide-react";
import { ContactForm } from "./contact-form";
import styles from "./contact-page.module.css";

export function ContactPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="contact-heading">
        <div className={styles.postcard}>
          <Image
            src="/auth.jpg"
            alt="Kigali Convention Centre and the surrounding hills at sunset"
            fill
            priority
            sizes="(max-width: 760px) 100vw, (max-width: 1200px) 42vw, 480px"
            className={styles.photograph}
          />
          <div className={styles.location}>
            <MapPin aria-hidden="true" />
            Kigali, Rwanda
          </div>
          <div className={styles.postcardNote}>
            <Compass aria-hidden="true" />
            <p>
              A little guidance.
              <br />A better journey.
            </p>
            <span>Cars, stays, and everything along the way.</span>
          </div>
        </div>
        <div className={styles.intro}>
          <div className={styles.pageLabel}>
            <MessageCircle aria-hidden="true" />
            Contact Pluto
          </div>
          <h1 id="contact-heading">Good journeys start with a conversation.</h1>
          <p className={styles.lead}>
            A question before you book? A detail to sort out? Tell us what’s on
            your mind. We’re here to help you take the next step.
          </p>
          <ContactForm />
        </div>
      </section>
      <section
        className={styles.shortcuts}
        aria-label="Find the right place to start"
      >
        <Link href="/account/bookings" className={styles.shortcut}>
          <span className={styles.shortcutIcon}>
            <Ticket aria-hidden="true" />
          </span>
          <div>
            <h2>Already have a booking?</h2>
            <p>Your reservation details are in your account.</p>
            <span className={styles.shortcutLabel}>View my bookings</span>
          </div>
          <MoveUpRight className={styles.shortcutArrow} aria-hidden="true" />
        </Link>
        <Link href="/partner-register" className={styles.shortcut}>
          <span className={styles.shortcutIcon}>
            <BriefcaseBusiness aria-hidden="true" />
          </span>
          <div>
            <h2>Let’s grow together.</h2>
            <p>Bring your cars or stays to Pluto Booking.</p>
            <span className={styles.shortcutLabel}>Become a partner</span>
          </div>
          <MoveUpRight className={styles.shortcutArrow} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
