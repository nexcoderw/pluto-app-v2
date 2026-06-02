"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { LogIn, Menu, Search, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserPortalPath } from "@/lib/user-portal";
import type { UserAuthProfile } from "@/services/api/auth";
import {
	getCachedPartnerProfileStatus,
	getCachedUserProfile,
	hasKnownUserSession,
	subscribeToUserSession,
} from "@/services/api/token-store";
import styles from "./public-navbar.module.css";

const navigationLinks = [
	{ href: "/listings?category=CAR", label: "Cars" },
	{ href: "/listings?category=APARTMENT", label: "Apartments" },
	{ href: "/listings?category=HOTEL_ROOM", label: "Hotel Rooms" },
	{ href: "/listings?category=AIRBNB_HOUSE", label: "AirBnB" },
	{ href: "/#contact", label: "Contact us" },
] as const;

export function PublicNavbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [currentUser, setCurrentUser] = useState<UserAuthProfile | null>(null);
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

	// Session display: use cached profile state only so guests do not trigger background refresh noise.
	useEffect(() => {
		setCurrentUser(hasKnownUserSession() ? getCachedUserProfile() : null);

		return subscribeToUserSession((user) => {
			setCurrentUser(user);
		});
	}, []);

	// Event handlers: keep the mobile menu local so public navigation stays reusable.
	function closeMenu() {
		setIsOpen(false);
	}

	function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
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
					<div className={styles.mobileAuth}>
						<AuthActions
							currentUser={currentUser}
							userPortalPath={userPortalPath}
							avatarStyle={avatarStyle}
							userInitials={userInitials}
							onNavigate={closeMenu}
						/>
					</div>
				</div>

				<div className={styles.authArea}>
					<AuthActions
						currentUser={currentUser}
						userPortalPath={userPortalPath}
						avatarStyle={avatarStyle}
						userInitials={userInitials}
						onNavigate={closeMenu}
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
	onNavigate,
}: {
	currentUser: UserAuthProfile | null;
	userPortalPath: string;
	avatarStyle?: CSSProperties;
	userInitials: string;
	onNavigate: () => void;
}) {
	if (currentUser) {
		return (
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
