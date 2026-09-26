import Image from "next/image";
import Link from "next/link";
import {
	ArrowDown,
	ArrowUpRight,
	BriefcaseBusiness,
	ChevronDown,
	Compass,
	Mail,
	MapPin,
	MessageCircle,
	MoveUpRight,
	Ticket,
} from "lucide-react";
import styles from "./contact-page.module.css";

const supportEmail = "support@plutobooking.com";

const questions = [
	{
		question: "What should I include in my message?",
		answer:
			"Tell us what you need help with and include your booking reference if you have one. For a new trip, share your destination, dates, and the kind of car or stay you’re looking for. Never include passwords or full payment card details.",
	},
	{
		question: "Where can I find my existing bookings?",
		answer:
			"Sign in to your customer account and open Bookings to see your reservations. If you’re contacting us about a reservation, include its reference so we can understand your request.",
		link: { href: "/account/bookings", label: "View my bookings" },
	},
	{
		question: "Can I list my property or car with Pluto?",
		answer:
			"Yes. Create a partner account to get started with listing your car, apartment, hotel room, or home. You can also email us with questions before you begin.",
		link: { href: "/partner-register", label: "Become a partner" },
	},
	{
		question: "Can you help me plan a flight?",
		answer:
			"Use our flight request page to share your route, travel dates, and passenger details. For a question about an existing request, email us with your request reference.",
		link: { href: "/flights", label: "Explore flight requests" },
	},
] as const;

export function ContactPage() {
	return (
		<main className={styles.page}>
			{/* A local photograph anchors the page in Pluto’s travel experience. */}
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
						<p>A little guidance.<br />A better journey.</p>
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
						A question before you book? A detail to sort out? Tell us what’s
						on your mind. We’re here to help you take the next step.
					</p>

					<div className={styles.emailPanel}>
						<div className={styles.emailHeading}>
							<Mail aria-hidden="true" />
							<h2>Let’s talk.</h2>
						</div>
						<p>Booking help, travel questions, or a new partnership.</p>
						<a className={styles.emailAddress} href={`mailto:${supportEmail}`}>
							{supportEmail}
							<ArrowUpRight aria-hidden="true" />
						</a>
						<a className={styles.primaryAction} href={`mailto:${supportEmail}`}>
							<Mail aria-hidden="true" />
							Write to us
							<ArrowUpRight aria-hidden="true" />
						</a>
						<span className={styles.emailHint}>Opens your email app.</span>
					</div>

					<a href="#contact-questions" className={styles.questionsAnchor}>
						A few answers before you ask
						<ArrowDown aria-hidden="true" />
					</a>
				</div>
			</section>

			{/* Direct routes give customers and partners a useful next step. */}
			<section className={styles.shortcuts} aria-label="Find the right place to start">
				<Link href="/account/bookings" className={styles.shortcut}>
					<span className={styles.shortcutIcon}><Ticket aria-hidden="true" /></span>
					<div>
						<h2>Already have a booking?</h2>
						<p>Your reservation details are in your account.</p>
						<span className={styles.shortcutLabel}>View my bookings</span>
					</div>
					<MoveUpRight className={styles.shortcutArrow} aria-hidden="true" />
				</Link>
				<Link href="/partner-register" className={styles.shortcut}>
					<span className={styles.shortcutIcon}><BriefcaseBusiness aria-hidden="true" /></span>
					<div>
						<h2>Let’s grow together.</h2>
						<p>Bring your cars or stays to Pluto Booking.</p>
						<span className={styles.shortcutLabel}>Become a partner</span>
					</div>
					<MoveUpRight className={styles.shortcutArrow} aria-hidden="true" />
				</Link>
			</section>

			<section id="contact-questions" className={styles.questions} aria-labelledby="questions-heading">
				<div className={styles.questionsIntro}>
					<h2 id="questions-heading">A little clarity,<br />before we connect.</h2>
					<p>Helpful starting points for your next conversation with us.</p>
				</div>
				<div className={styles.questionList}>
					{questions.map((question) => (
						<details key={question.question} className={styles.question}>
							<summary>
								{question.question}
								<ChevronDown aria-hidden="true" />
								</summary>
							<div className={styles.answer}>
								<p>{question.answer}</p>
								{"link" in question ? (
									<Link href={question.link.href}>
										{question.link.label}<ArrowUpRight aria-hidden="true" />
									</Link>
								) : null}
							</div>
						</details>
					))}
				</div>
			</section>
		</main>
	);
}
