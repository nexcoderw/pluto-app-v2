"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	ArrowRight,
	CirclePlay,
	LogIn,
	Menu,
	PlaneTakeoff,
	Power,
	Sparkles,
	UserPlus,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	isPublicNavigationLinkActive,
	PUBLIC_NAVIGATION_LINKS,
} from "@/constants/public-navigation";
import { useUserSession } from "@/hooks/use-user-session";
import { getUserPortalPath } from "@/lib/user-portal";
import { logoutUser, type UserAuthProfile } from "@/services/api/auth";
import { getCachedPartnerProfileStatus } from "@/services/api/token-store";
import { CurrencySelector } from "@/components/shared/currency-selector";
import { FeaturedListings } from "./featured-listings";
import { HomeSearch } from "./home-search";
import { PopularCategories } from "./popular-categories";
import styles from "./home-page-experience.module.css";

export function HomePageExperience() {
	return (
		<main className={styles.page}>
			<section className={styles.hero} aria-label="Pluto Booking homepage">
				<HomeNavbar />

				<div className={styles.heroCanvas}>
					<Image
						src="/hero/clouds-v2.png"
						alt=""
						fill
						priority
						sizes="(max-width: 760px) 100vw, 92vw"
						className={styles.cloudImage}
					/>
					<Image
						src="/hero/plane-v2.png"
						alt="Passenger airplane climbing above the clouds"
						width={1774}
						height={887}
						priority
						className={styles.planeImage}
					/>

					<div className={styles.journeyRail} aria-hidden="true">
						<strong>01</strong>
						<span>02</span>
						<span>03</span>
					</div>

					<div className={styles.heroContent}>
						<div className={styles.heroEyebrow}>
							<Sparkles aria-hidden="true" />
							Elevate your travel journey
						</div>
						<h1>Experience the freedom to go further.</h1>
						<p>
							Verified stays, trusted cars, and managed flights—all brought
							together for a smoother journey.
						</p>
						<div className={styles.heroActions}>
							<Link href="/listings" className={styles.heroPrimaryAction}>
								Explore listings
								<ArrowRight aria-hidden="true" />
							</Link>
							<Link
								href="/flights"
								className={styles.heroPlayAction}
								aria-label="Explore managed flight requests"
							>
								<CirclePlay aria-hidden="true" />
							</Link>
						</div>
					</div>

					<Link href="/listings" className={styles.discoveryCard}>
						<div className={styles.discoveryHeading}>
							<strong>Know more</strong>
							<ArrowRight aria-hidden="true" />
						</div>
						<div className={styles.discoveryBody}>
							<span className={styles.discoveryImages} aria-hidden="true">
								<Image
									src="/services/car-rent.png"
									alt=""
									width={52}
									height={52}
								/>
								<Image
									src="/services/apartment.png"
									alt=""
									width={52}
									height={52}
								/>
								<Image
									src="/services/hotel.png"
									alt=""
									width={52}
									height={52}
								/>
							</span>
							<span>
								<strong>Every trip, one place</strong>
								<small>Discover your next car or stay with confidence.</small>
							</span>
						</div>
					</Link>

					<div className={styles.flightBadge}>
						<PlaneTakeoff aria-hidden="true" />
						<span>Travel, beautifully arranged.</span>
					</div>
				</div>
			</section>
			<div className={styles.searchDock}>
				<HomeSearch />
			</div>
			<PopularCategories />
			<FeaturedListings />
		</main>
	);
}

function HomeNavbar() {
	const pathname = usePathname();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [currentHash, setCurrentHash] = useState("");
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

	useEffect(() => {
		function updateHash() {
			setCurrentHash(window.location.hash);
		}

		updateHash();
		window.addEventListener("hashchange", updateHash);
		return () => window.removeEventListener("hashchange", updateHash);
	}, []);

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
					{PUBLIC_NAVIGATION_LINKS.map((link) => {
						const isActive = isPublicNavigationLinkActive(
							pathname,
							link.href,
							currentHash,
						);

						return (
							<Link
								key={link.href}
								href={link.href}
								data-active={isActive ? "true" : "false"}
								aria-current={
									isActive
										? link.href.includes("#")
											? "location"
											: "page"
										: undefined
								}
								onClick={closeMenu}
							>
								{link.label}
							</Link>
						);
					})}
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

				<div className={styles.homeCurrency}>
					<CurrencySelector />
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
