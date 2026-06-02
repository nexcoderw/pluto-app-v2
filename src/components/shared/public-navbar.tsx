"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./public-navbar.module.css";

const navigationLinks = [
	{ href: "/marketplace?category=CAR", label: "Cars" },
	{ href: "/marketplace?category=APARTMENT", label: "Apartments" },
	{ href: "/marketplace?category=HOTEL_ROOM", label: "Hotel Rooms" },
	{ href: "/marketplace?category=AIRBNB_HOUSE", label: "AirBnB" },
	{ href: "/#contact", label: "Contact us" },
] as const;

export function PublicNavbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");

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
					<Image src="/favicon.png" alt="" width={28} height={28} priority />
					<span>Pluto Booking</span>
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
