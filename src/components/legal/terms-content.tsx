import Link from "next/link";
import {
	ArrowUpRight,
	Building2,
	CalendarDays,
	CarFront,
	FileCheck2,
	Handshake,
	Mail,
	MapPin,
	Phone,
	Users,
} from "lucide-react";
import styles from "./terms-content.module.css";

type TermsItem = { label?: string; text: string };
type TermsBlock = { title?: string; paragraphs?: string[]; items?: TermsItem[] };
type TermsSection = { id: string; number: string; title: string; blocks: TermsBlock[] };

const customerSections: TermsSection[] = [
	section("customer-agreement", "01", "Agreement", [
		"These Terms and Conditions govern your use of booking services provided by PlutoBooking.com through plutobooking.com. By making a booking, you acknowledge that you have read, understood, and agree to these terms.",
	]),
	section("customer-role", "02", "Our role", [
		"We act as an intermediary between you and service providers, including hotels, guest houses, car rental companies, air ticketing providers, and transfer providers. We facilitate booking, while the contract for the booked service is between you and the relevant service provider.",
	]),
	{
		id: "customer-booking",
		number: "03",
		title: "Booking process and confirmation",
		blocks: [{ items: [
			{ text: "You are responsible for accurate booking details, including dates, guest numbers, and the driver's age for car rentals." },
			{ text: "A booking is confirmed only after you receive a confirmation email with a valid voucher or reference number." },
			{ text: "Review your confirmation carefully and notify us immediately of errors." },
		] }],
	},
	section("customer-payment", "04", "Pricing and payment", [
		"Prices are displayed in Rwandan francs (RWF) or United States dollars (USD) and include applicable taxes unless stated otherwise.",
		"Payment is processed when you book unless a Pay Later option is available. Your payment card or mobile money account may be pre-authorized, or the provider may charge a deposit under its policy.",
	]),
	{
		id: "customer-cancellation",
		number: "05",
		title: "Free cancellation and refunds",
		blocks: [
			{
				title: "Hotels, guest houses, and car rentals",
				paragraphs: ["Most listed properties and car rentals offer free cancellation. The specific policy for your booking appears on the listing and in your confirmation email."],
				items: [
					{ label: "Free cancellation period", text: "You may cancel without charge up to 48 hours before accommodation check-in or vehicle pick-up, unless the booking-specific policy states otherwise." },
					{ label: "Refund process", text: "Eligible cancellations receive a full refund of the accommodation or rental amount to the original payment method." },
					{ label: "Late cancellation or no-show", text: "A cancellation after the free period, or failure to arrive, may incur a charge of up to 100% of the booking value under the provider's policy." },
				],
			},
			{
				title: "Transfer fees",
				paragraphs: [
					"Fees charged by payment processors or financial institutions for the original payment or refund are non-refundable. These can include foreign transaction, currency conversion, payment gateway, and bank wire fees.",
					"Transfer fees are deducted from the refund to cover the cost of sending funds back to your account. The applicable fee is typically 5% of the refund amount or a fixed fee disclosed for the transaction. For example, where a USD 1,000 refund incurs a 5% bank fee, you receive USD 950 and the USD 50 transfer fee is non-refundable.",
				],
			},
		],
	},
	{
		id: "customer-services",
		number: "06",
		title: "Specific service terms",
		blocks: [{ items: [
			{ label: "Hotels and guest houses", text: "Property house rules apply, including check-in and check-out times, age restrictions, and damage policies." },
			{ label: "Car rentals", text: "The rental company's terms apply. You must present a valid driver's license and payment card and meet its age requirements. Fuel, additional drivers, young-driver fees, and insurance may be payable directly to the rental company." },
			{ label: "Transfers", text: "Airport and other transfer cancellation policies may be strict or non-refundable. Review the policy when booking." },
		] }],
	},
	section("customer-changes", "07", "Changes to a booking", [
		"Requests to change dates, names, or other details require the service provider's approval, remain subject to its policy, and may incur fees.",
	]),
	section("customer-force-majeure", "08", "Force majeure", [
		"We and our providers are not liable for a failure caused by events outside reasonable control, including natural disasters, war, terrorism, pandemics, government restrictions, or significant weather. Standard cancellation policies may apply. We will seek refunds or credits where possible but cannot guarantee them.",
	]),
	section("customer-responsibility", "09", "Customer responsibility", [
		"You are responsible for your conduct and for damage you cause to a property or rental vehicle. The provider may charge you directly for resulting damage.",
	]),
	section("customer-liability", "10", "Limitation of liability", [
		"To the fullest extent permitted by law, our liability is limited to the value of the booking made through our site. We are not liable for indirect, incidental, or consequential damages arising from use of our site or services provided by third parties.",
	]),
	section("customer-privacy", "11", "Privacy", [
		"Our separate Privacy Policy explains how we collect, use, and protect personal information.",
	]),
	section("customer-law", "12", "Governing law", [
		"These terms are governed by and construed under the laws of Rwanda.",
	]),
	{
		id: "customer-contact",
		number: "13",
		title: "Contact us",
		blocks: [{ items: [
			{ label: "Email", text: "plutobooking.info@gmail.com" },
			{ label: "Phone", text: "+250 788 221 683" },
			{ label: "Hours", text: "24 hours a day, Monday through Sunday" },
		] }],
	},
];

const partnerSections: TermsSection[] = [
	section("partner-parties", "01", "Introduction and parties", [
		"This agreement governs the partnership between PlutoBooking.com, located at Nyarutarama, KG 414 Street, Kigali, Rwanda, and each partner listing accommodation or car rental services on the platform.",
		"By selecting the agreement checkbox or completing online registration, you agree to these terms.",
	]),
	{
		id: "partner-definitions",
		number: "02",
		title: "Definitions",
		blocks: [{ items: [
			{ label: "Platform", text: "PlutoBooking.com, its mobile application, and related services." },
			{ label: "Listing", text: "A property or car rental fleet registered and made available for booking." },
			{ label: "Guest", text: "An end user who books through the platform." },
			{ label: "Booking", text: "A guest reservation for partner services through the platform." },
			{ label: "Commission", text: "The platform fee payable for each completed booking." },
		] }],
	},
	{
		id: "partner-obligations",
		number: "03",
		title: "Partner obligations and warranties",
		blocks: [{ items: [
			{ label: "Accuracy", text: "Listing descriptions, amenities, photos, prices, availability, specifications, and policies must be complete, current, and not misleading." },
			{ label: "Quality and licensing", text: "You must hold all required licenses, permits, and insurance and maintain the advertised service quality." },
			{ label: "Pricing and parity", text: "You must provide your best available public net rate. The platform price must be equal to or lower than rates on other online or offline channels." },
			{ label: "Availability", text: "You must manage calendars or fleets in real time and honor confirmed bookings. Failure to do so may result in penalties." },
			{ label: "Guest relationship", text: "You are responsible for guest safety and satisfaction, delivering advertised services, handling complaints, and meeting safety regulations." },
		] }],
	},
	{
		id: "partner-financial",
		number: "04",
		title: "Booking and financial terms",
		blocks: [
			{ title: "Commission", paragraphs: ["The partner pays a 10% commission on the total booking value, including the room or rental rate, taxes, and mandatory fees but excluding optional guest extras. Total booking value means the amount the guest pays to the platform."] },
			{ title: "Payment process", items: [
				{ text: "The platform collects payment from the guest." },
				{ text: "The platform remits the total booking value less commission after check-in or vehicle collection. Payments are processed twice per week and, where delayed, within 11 days, subject to resolution of customer disputes." },
				{ text: "Partner payments are made by bank transfer to the account supplied by the partner." },
			] },
			{ title: "Taxes", paragraphs: ["The partner is responsible for collecting, reporting, and remitting all applicable taxes, including VAT, sales, or tourist taxes. Platform commission remains subject to applicable service taxes."] },
		],
	},
	{
		id: "partner-platform",
		number: "05",
		title: "Platform obligations",
		blocks: [{ items: [
			{ label: "Listing", text: "We make approved partner properties and vehicles available for booking." },
			{ label: "Promotion", text: "We may market and promote listings through our channels at our discretion." },
			{ label: "Customer service", text: "We support guests through booking. Service concerns after booking are primarily the partner's responsibility." },
		] }],
	},
	{
		id: "partner-cancellation",
		number: "06",
		title: "Cancellations and modifications",
		blocks: [{ items: [
			{ label: "Partner cancellation", text: "Notify the platform immediately if cancellation is unavoidable. Frequent cancellation may cause penalties, lower search visibility, or removal." },
			{ label: "Guest cancellation", text: "The listing's cancellation policy applies. We administer the refund and adjust commission; no commission is due where the guest receives a full refund." },
		] }],
	},
	section("partner-ip", "07", "Intellectual property", [
		"You grant the platform a royalty-free, worldwide license to use your logos, trademarks, photos, and other partner content to market, promote, and sell your listings.",
		"You warrant that you own or hold the necessary rights to that content and that it does not infringe third-party rights.",
	]),
	{
		id: "partner-liability",
		number: "08",
		title: "Liability and insurance",
		blocks: [{ items: [
			{ label: "Platform liability", text: "We act as an intermediary and are not liable for a partner's acts, errors, omissions, warranties, or negligence. Our total liability is limited to commission earned from the booking concerned." },
			{ label: "Partner liability", text: "The partner is responsible for loss, damage, injury, or expense caused by its acts, omissions, or breach." },
			{ label: "Insurance", text: "The partner must maintain adequate insurance, including public liability cover for accommodation and comprehensive motor vehicle cover for rentals." },
		] }],
	},
	section("partner-data", "09", "Data protection and confidentiality", [
		"Both parties must comply with applicable data protection laws, including GDPR where it applies. A partner may use guest personal data supplied by the platform only to fulfill the confirmed booking.",
	]),
	{
		id: "partner-termination",
		number: "10",
		title: "Term and termination",
		blocks: [{ items: [
			{ label: "Term", text: "The agreement starts on its effective date and continues until either party terminates it." },
			{ label: "For cause", text: "Either party may terminate immediately following the other party's material breach." },
			{ label: "For convenience", text: "Either party may terminate by unlisting." },
			{ label: "After termination", text: "Listings are removed, confirmed bookings must be honored, and these terms continue to apply to those bookings." },
		] }],
	},
	section("partner-disputes", "11", "Governing law and disputes", [
		"This agreement is governed by the laws of Rwanda. The parties will first seek to resolve disputes through good-faith negotiation. Unresolved disputes are subject to the courts of Rwanda in Kigali.",
	]),
	{
		id: "partner-miscellaneous",
		number: "12",
		title: "Miscellaneous and authorization",
		blocks: [
			{ items: [
				{ label: "Entire agreement", text: "These terms constitute the entire agreement between the parties." },
				{ label: "Amendments", text: "We may amend the terms with written notice. Continued use constitutes acceptance." },
				{ label: "Force majeure", text: "Neither party is liable for failure caused by events outside reasonable control." },
			] },
			{ paragraphs: [
				"By selecting the agreement checkbox, the partner's authorized representative confirms that they have read, understood, and accepted these terms and conditions.",
				"For PlutoBooking.com, the authorized representative is the Chief Executive Officer.",
			] },
		],
	},
];

export function TermsContent() {
	return (
		<main className={styles.page}>
			<section className={styles.hero} aria-labelledby="terms-title">
				<div className={styles.heroIcon} aria-hidden="true"><FileCheck2 /></div>
				<p className={styles.eyebrow}>Legal clarity</p>
				<h1 id="terms-title">Terms built around trust.</h1>
				<p className={styles.heroCopy}>Understand the commitments that protect every booking and every partnership on Pluto Booking.</p>
				<div className={styles.meta}>
					<span><CalendarDays aria-hidden="true" />Last updated 5 October 2026</span>
					<span><MapPin aria-hidden="true" />Governed by the laws of Rwanda</span>
				</div>
			</section>

			<nav className={styles.audienceNav} aria-label="Terms audiences">
				<a href="#customer-terms"><Users aria-hidden="true" />Customer terms</a>
				<a href="#partner-terms"><Handshake aria-hidden="true" />Partner terms</a>
			</nav>

			<LegalArticle id="customer-terms" eyebrow="For travelers and guests" title="Customer booking terms" description="These terms apply when you reserve accommodation, rental vehicles, flights, or transfer services through Pluto Booking." icon="customer" sections={customerSections} />
			<LegalArticle id="partner-terms" eyebrow="For service providers" title="Partner listing terms" description="These terms apply to accommodation and car-rental partners who publish and fulfill listings through Pluto Booking." icon="partner" sections={partnerSections} />

			<section className={styles.support} aria-labelledby="legal-support-title">
				<div>
					<p className={styles.eyebrow}>Questions about these terms?</p>
					<h2 id="legal-support-title">We are available every day.</h2>
					<p>Contact our team for booking changes, cancellations, or clarification.</p>
				</div>
				<div className={styles.supportLinks}>
					<a href="mailto:plutobooking.info@gmail.com"><Mail aria-hidden="true" />plutobooking.info@gmail.com</a>
					<a href="tel:+250788221683"><Phone aria-hidden="true" />+250 788 221 683</a>
					<Link href="/contact"><ArrowUpRight aria-hidden="true" />Contact page</Link>
				</div>
			</section>
		</main>
	);
}

function LegalArticle({ id, eyebrow, title, description, icon, sections }: { id: string; eyebrow: string; title: string; description: string; icon: "customer" | "partner"; sections: TermsSection[] }) {
	const Icon = icon === "customer" ? CarFront : Building2;
	return (
		<article className={styles.article} id={id}>
			<header className={styles.articleHeader}>
				<div className={styles.articleIcon}><Icon aria-hidden="true" /></div>
				<div><p className={styles.eyebrow}>{eyebrow}</p><h2>{title}</h2><p>{description}</p></div>
			</header>
			<div className={styles.articleLayout}>
				<nav className={styles.contents} aria-label={`${title} contents`}>
					<p>In this agreement</p>
					<ol>{sections.map((item) => <li key={item.id}><a href={`#${item.id}`}><span>{item.number}</span>{item.title}</a></li>)}</ol>
				</nav>
				<div className={styles.sections}>{sections.map((item) => <SectionContent key={item.id} section={item} />)}</div>
			</div>
		</article>
	);
}

function SectionContent({ section: item }: { section: TermsSection }) {
	return (
		<section id={item.id} className={styles.section}>
			<span className={styles.sectionNumber}>{item.number}</span>
			<div>
				<h2>{item.title}</h2>
				{item.blocks.map((block, index) => (
					<div className={styles.block} key={`${item.id}-${index}`}>
						{block.title ? <h3>{block.title}</h3> : null}
						{block.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
						{block.items ? <ul>{block.items.map((entry) => <li key={`${entry.label}-${entry.text}`}>{entry.label ? <strong>{entry.label}: </strong> : null}{entry.text}</li>)}</ul> : null}
					</div>
				))}
				{item.id === "customer-privacy" ? <p><Link href="/privacy">Read the Privacy Policy</Link></p> : null}
			</div>
		</section>
	);
}

function section(id: string, number: string, title: string, paragraphs: string[]): TermsSection {
	return { id, number, title, blocks: [{ paragraphs }] };
}
