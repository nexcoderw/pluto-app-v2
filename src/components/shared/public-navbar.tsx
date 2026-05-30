'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogIn, Menu, Search, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './public-navbar.module.css';

const navigationLinks = [
	{ href: '/', label: 'Explore' },
	{ href: '/partner-register', label: 'List with Pluto' },
	{ href: '/login', label: 'Sign in' },
] as const;

export function PublicNavbar() {
	const [isOpen, setIsOpen] = useState(false);

	// Event handlers: keep the mobile menu local so public navigation stays reusable.
	function closeMenu() {
		setIsOpen(false);
	}

	return (
		<header className={styles.header}>
			<nav className={styles.nav} aria-label="Main navigation">
				<Link href="/" className={styles.brand} onClick={closeMenu}>
					<Image
						src="/logo-b.png"
						alt="Pluto Booking"
						width={630}
						height={185}
						priority
					/>
				</Link>

				<div className={styles.links} data-open={isOpen}>
					{navigationLinks.map((link) => (
						<Link key={link.href} href={link.href} onClick={closeMenu}>
							{link.label}
						</Link>
					))}
				</div>

				<div className={styles.actions}>
					<Link href="/" className={styles.searchButton}>
						<Search aria-hidden="true" />
						Search
					</Link>
					<Link href="/login" className={styles.loginButton}>
						<LogIn aria-hidden="true" />
						Login
					</Link>
					<Link href="/register" className={styles.registerButton}>
						<UserPlus aria-hidden="true" />
						Register
					</Link>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					className={styles.menuButton}
					aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
					aria-expanded={isOpen}
					onClick={() => setIsOpen((value) => !value)}
				>
					{isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
				</Button>
			</nav>
		</header>
	);
}
