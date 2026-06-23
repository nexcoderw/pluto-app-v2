"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Menu, Power, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUserSession } from "@/hooks/use-user-session";
import { getUserPortalPath } from "@/lib/user-portal";
import { logoutUser, type UserAuthProfile } from "@/services/api/auth";
import { getCachedPartnerProfileStatus } from "@/services/api/token-store";
import { FeaturedListings } from "./featured-listings";
import { HomeSearch } from "./home-search";
import { PartnerCta } from "./partner-cta";
import { PopularCategories } from "./popular-categories";
import { WhyPlutoBooking } from "./why-pluto-booking";
import styles from "./home-page-experience.module.css";

const navigationLinks = [
	{ href: "/flights", label: "Flight" },
	{ href: "/listings/cars", label: "Cars" },
	{ href: "/listings/apartments", label: "Apartments" },
	{ href: "/listings/hotel-rooms", label: "Hotel Rooms" },
	{ href: "/listings/airbnb", label: "AirBnB" },
	{ href: "/#contact", label: "Contact us" },
] as const;

export function HomePageExperience() {
	return (
		<main className={styles.page}>
			<section className={styles.hero} aria-label="Pluto Booking homepage">
				<div className={styles.heroBackdrop} aria-hidden="true" />
				<HomeNavbar />

				<div className={styles.heroContent}>
					<h1>Find the stay or rental that fits your next move.</h1>
					<p>
						Search verified cars, apartments, hotel rooms, and AirBnB-style
						stays from trusted Pluto Booking partners.
					</p>
				</div>

				<HomeSearch />
			</section>
			<PopularCategories />
			<FeaturedListings />
			<WhyPlutoBooking />
			<PartnerCta />
		</main>
	);
}

function HomeNavbar() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const currentUser = useUserSession();
	const userPortalPath = currentUser
		? getUserPortalPath(currentUser, getCachedPartnerProfileStatus())
		: "/login";
	const avatarStyle = currentUser?.imageUrl
		? ({
				"--home-avatar-image": `url("${currentUser.imageUrl}")`,
			} as CSSProperties)
		: undefined;
	const userInitials = useMemo(
		() => getUserInitials(currentUser?.fullName ?? currentUser?.email ?? ""),
		[currentUser],
	);

	function closeMenu() {
		setIsOpen(false);
	}

	async function handleLogout() {
		setIsLoggingOut(true);
		closeMenu();

		try {
			await logoutUser();
			toast.success("Signed out successfully.", {
				description: "Your Pluto Booking session has ended.",
			});
		} catch {
			toast.success("Signed out locally.", {
				description:
					"Your browser session was cleared. Sign in again before opening protected pages.",
			});
		} finally {
			setIsLoggingOut(false);
			router.replace("/");
		}
	}

	return (
		<header className={styles.homeHeader}>
			<nav className={styles.homeNav} aria-label="Homepage navigation">
				<Link href="/" className={styles.homeBrand} onClick={closeMenu}>
					<Image
						src="/logo-b.png"
						alt="Pluto Booking"
						width={430}
						height={85}
						priority
					/>
				</Link>

				<div className={styles.homeLinks} data-open={isOpen}>
					{navigationLinks.map((link) => (
						<Link key={link.href} href={link.href} onClick={closeMenu}>
							{link.label}
						</Link>
					))}
					<div
						className={styles.mobileAuth}
						data-authenticated={Boolean(currentUser)}
					>
						<HomeAuthActions
							currentUser={currentUser}
							userPortalPath={userPortalPath}
							avatarStyle={avatarStyle}
							userInitials={userInitials}
							isLoggingOut={isLoggingOut}
							onNavigate={closeMenu}
							onLogout={handleLogout}
						/>
					</div>
				</div>

				<div className={styles.homeAuth}>
					<HomeAuthActions
						currentUser={currentUser}
						userPortalPath={userPortalPath}
						avatarStyle={avatarStyle}
						userInitials={userInitials}
						isLoggingOut={isLoggingOut}
						onNavigate={closeMenu}
						onLogout={handleLogout}
					/>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					className={styles.homeMenuButton}
					aria-label={isOpen ? "Close homepage menu" : "Open homepage menu"}
					aria-expanded={isOpen}
					onClick={() => setIsOpen((current) => !current)}
				>
					{isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
				</Button>
			</nav>
		</header>
	);
}

function HomeAuthActions({
	currentUser,
	userPortalPath,
	avatarStyle,
	userInitials,
	isLoggingOut,
	onNavigate,
	onLogout,
}: {
	currentUser: UserAuthProfile | null;
	userPortalPath: string;
	avatarStyle?: CSSProperties;
	userInitials: string;
	isLoggingOut: boolean;
	onNavigate: () => void;
	onLogout: () => void;
}) {
	if (currentUser) {
		return (
			<>
				<Link
					href={userPortalPath}
					className={styles.profileButton}
					onClick={onNavigate}
				>
					<span
						className={styles.avatar}
						data-has-image={Boolean(currentUser.imageUrl)}
						style={avatarStyle}
						aria-hidden="true"
					>
						{currentUser.imageUrl ? null : userInitials}
					</span>
					<span className={styles.profileCopy}>
						<strong>{currentUser.fullName}</strong>
						<small>
							{currentUser.role === "PARTNER"
								? "Partner portal"
								: "Customer portal"}
						</small>
					</span>
				</Link>
				<button
					type="button"
					className={styles.powerButton}
					aria-label="Sign out"
					disabled={isLoggingOut}
					onClick={onLogout}
				>
					<Power aria-hidden="true" />
				</button>
			</>
		);
	}

	return (
		<>
			<Link href="/login" className={styles.loginButton} onClick={onNavigate}>
				<LogIn aria-hidden="true" />
				Login
			</Link>
			<Link
				href="/register"
				className={styles.registerButton}
				onClick={onNavigate}
			>
				<UserPlus aria-hidden="true" />
				Sign up
			</Link>
		</>
	);
}

function getUserInitials(value: string) {
	const [first = "P", second = "B"] = value.trim().split(/\s+/).filter(Boolean);

	return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
