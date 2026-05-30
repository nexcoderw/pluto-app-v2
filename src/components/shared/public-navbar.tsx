'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogIn, Menu, Search, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserPortalPath } from '@/lib/user-portal';
import {
	refreshUserSession,
	type UserAuthProfile,
} from '@/services/api/auth';
import styles from './public-navbar.module.css';

const navigationLinks = [
	{ href: '/', label: 'Explore' },
	{ href: '/partner-register', label: 'List with Pluto' },
] as const;

export function PublicNavbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<UserAuthProfile | null>(null);
	const userPortalPath = currentUser ? getUserPortalPath(currentUser) : '/login';
	const avatarStyle = currentUser?.imageUrl
		? ({
				'--profile-avatar-image': `url("${currentUser.imageUrl}")`,
			} as CSSProperties)
		: undefined;
	const userInitials = useMemo(
		() => getUserInitials(currentUser?.fullName ?? currentUser?.email ?? ''),
		[currentUser],
	);

	// Session check: refresh uses the secure cookie without exposing tokens to the browser UI.
	useEffect(() => {
		let isActive = true;

		refreshUserSession()
			.then((response) => {
				if (isActive) {
					setCurrentUser(response.user);
				}
			})
			.catch(() => {
				if (isActive) {
					setCurrentUser(null);
				}
			})

		return () => {
			isActive = false;
		};
	}, []);

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
					{currentUser ? (
						<Link href={userPortalPath} onClick={closeMenu}>
							My portal
						</Link>
					) : (
						<Link href="/login" onClick={closeMenu}>
							Sign in
						</Link>
					)}
				</div>

				<div className={styles.actions}>
					<Link href="/" className={styles.searchButton}>
						<Search aria-hidden="true" />
						Search
					</Link>
					{currentUser ? (
						<Link href={userPortalPath} className={styles.profileButton}>
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
									{currentUser.role === 'PARTNER'
										? 'Partner portal'
										: 'Customer portal'}
								</small>
							</span>
						</Link>
					) : (
						<>
							<Link href="/login" className={styles.loginButton}>
								<LogIn aria-hidden="true" />
								Login
							</Link>
							<Link href="/register" className={styles.registerButton}>
								<UserPlus aria-hidden="true" />
								Register
							</Link>
						</>
					)}
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

function getUserInitials(value: string) {
	const [first = 'P', second = 'B'] = value
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
