"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { LogIn, Menu, Power, Search, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUserSession } from "@/hooks/use-user-session";
import { getUserPortalPath } from "@/lib/user-portal";
import { logoutUser, type UserAuthProfile } from "@/services/api/auth";
import { getCachedPartnerProfileStatus } from "@/services/api/token-store";
import styles from "./public-navbar.module.css";

const navigationLinks = [
	{ href: "/listings/cars", label: "Cars" },
	{ href: "/listings/apartments", label: "Apartments" },
	{ href: "/listings/hotel-rooms", label: "Hotel Rooms" },
	{ href: "/listings/airbnb", label: "AirBnB" },
	{ href: "/#contact", label: "Contact us" },
] as const;

export function PublicNavbar() {
	const pathname = usePathname();

	if (pathname === "/") {
		return null;
	}

	return <PublicNavbarContent />;
}

function PublicNavbarContent() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const currentUser = useUserSession();
	const userPortalPath = currentUser
		? getUserPortalPath(currentUser, getCachedPartnerProfileStatus())
		: "/login";
	const avatarStyle = currentUser?.imageUrl
		? ({
				"--profile-avatar-image": `url("${currentUser.imageUrl}")`,
			} as CSSProperties)
		: undefined;
	const userInitials = useMemo(
		() => getUserInitials(currentUser?.fullName ?? currentUser?.email ?? ""),
		[currentUser],
	);

	// Event handlers: keep the mobile menu local so public navigation stays reusable.
	function closeMenu() {
		setIsOpen(false);
	}

	function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	// Logout flow: clear the refresh cookie, remove cached session state, and return to the public homepage.
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
		<header className={styles.header}>
			<nav className={styles.nav} aria-label="Main navigation">
				<Link href="/" className={styles.brand} onClick={closeMenu}>
					<Image
						src="/logo-b.png"
						alt="Pluto Booking"
						width={430}
						height={85}
						priority
					/>
				</Link>

				<form className={styles.searchForm} onSubmit={handleSearchSubmit}>
					<Search aria-hidden="true" />
					<label className="sr-only" htmlFor="public-navbar-search">
						Search listings
					</label>
					<input
						id="public-navbar-search"
						type="search"
						value={search}
						placeholder="Search listings"
						onChange={(event) => setSearch(event.target.value)}
					/>
				</form>

				<div className={styles.links} data-open={isOpen}>
					<form
						className={styles.mobileSearchForm}
						onSubmit={handleSearchSubmit}
					>
						<Search aria-hidden="true" />
						<label className="sr-only" htmlFor="public-mobile-navbar-search">
							Search listings
						</label>
						<input
							id="public-mobile-navbar-search"
							type="search"
							value={search}
							placeholder="Search listings"
							onChange={(event) => setSearch(event.target.value)}
						/>
					</form>
					{navigationLinks.map((link) => (
						<Link key={link.href} href={link.href} onClick={closeMenu}>
							{link.label}
						</Link>
					))}
					<div
						className={styles.mobileAuth}
						data-authenticated={Boolean(currentUser)}
					>
						<AuthActions
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

				<div className={styles.authArea}>
					<AuthActions
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
					className={styles.menuButton}
					aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
					aria-expanded={isOpen}
					onClick={() => setIsOpen((value) => !value)}
				>
					{isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
				</Button>
			</nav>
		</header>
	);
}

function AuthActions({
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
					aria-label="Sign out and return to homepage"
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
