"use client";

import type { CSSProperties, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
	ArrowRight,
	BedDouble,
	Building2,
	CalendarDays,
	CarFront,
	Hotel,
	LogIn,
	Menu,
	Plane,
	Power,
	Search,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useUserSession } from "@/hooks/use-user-session";
import { getUserPortalPath } from "@/lib/user-portal";
import { logoutUser, type UserAuthProfile } from "@/services/api/auth";
import { getCachedPartnerProfileStatus } from "@/services/api/token-store";
import styles from "./home-page-experience.module.css";

type HomeSearchCategory =
	| "cars"
	| "apartments"
	| "hotel-rooms"
	| "airbnb"
	| "flight";

type SearchCategory = {
	id: HomeSearchCategory;
	label: string;
	shortLabel: string;
	route: string;
	placeholder: string;
	comingSoon?: boolean;
	icon: typeof CarFront;
};

const today = new Date();
const defaultDateRange: DateRange = {
	from: today,
	to: addDays(today, 3),
};

const navigationLinks = [
	{ href: "/listings/cars", label: "Cars" },
	{ href: "/listings/apartments", label: "Apartments" },
	{ href: "/listings/hotel-rooms", label: "Hotel Rooms" },
	{ href: "/listings/airbnb", label: "AirBnB" },
	{ href: "/#contact", label: "Contact us" },
] as const;

const searchCategories: SearchCategory[] = [
	{
		id: "cars",
		label: "Car rent",
		shortLabel: "Cars",
		route: "/listings/cars",
		placeholder: "Search car rentals, city, model, or partner",
		icon: CarFront,
	},
	{
		id: "apartments",
		label: "Apartment",
		shortLabel: "Apartments",
		route: "/listings/apartments",
		placeholder: "Search apartments by location or name",
		icon: Building2,
	},
	{
		id: "hotel-rooms",
		label: "Hotel",
		shortLabel: "Hotels",
		route: "/listings/hotel-rooms",
		placeholder: "Search hotel rooms by area or hotel name",
		icon: Hotel,
	},
	{
		id: "airbnb",
		label: "Airbnb",
		shortLabel: "AirBnB",
		route: "/listings/airbnb",
		placeholder: "Search homes, stays, or neighborhoods",
		icon: BedDouble,
	},
	{
		id: "flight",
		label: "Flight",
		shortLabel: "Flights",
		route: "/",
		placeholder: "Flight booking is coming soon",
		icon: Plane,
		comingSoon: true,
	},
];

export function HomePageExperience() {
	const router = useRouter();
	const [activeCategory, setActiveCategory] =
		useState<HomeSearchCategory>("cars");
	const [search, setSearch] = useState("");
	const [guests, setGuests] = useState(1);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(
		defaultDateRange,
	);
	const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
	const activeSearchCategory = useMemo(
		() =>
			searchCategories.find((category) => category.id === activeCategory) ??
			searchCategories[0],
		[activeCategory],
	);

	function selectCategory(category: SearchCategory) {
		setActiveCategory(category.id);

		if (category.comingSoon) {
			toast.info("Flight booking is coming soon.", {
				description:
					"We are preparing flight search for a later Pluto Booking release.",
			});
		}
	}

	function submitSearch(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (activeSearchCategory.comingSoon) {
			toast.info("Flights are coming soon.", {
				description:
					"Use cars, apartments, hotel rooms, or AirBnB while flight search is being prepared.",
			});
			return;
		}

		const params = new URLSearchParams();
		const cleanSearch = search.trim();

		if (cleanSearch) {
			params.set("search", cleanSearch);
		}

		if (dateRange?.from) {
			params.set("from", format(dateRange.from, "yyyy-MM-dd"));
		}

		if (dateRange?.to) {
			params.set("to", format(dateRange.to, "yyyy-MM-dd"));
		}

		if (guests > 1 && activeCategory !== "cars") {
			params.set("guests", String(guests));
		}

		const queryString = params.toString();
		router.push(
			`${activeSearchCategory.route}${queryString ? `?${queryString}` : ""}`,
		);
	}

	return (
		<main className={styles.page}>
			<section className={styles.hero} aria-label="Pluto Booking homepage">
				<div className={styles.heroBackdrop} aria-hidden="true" />
				<HomeNavbar />

				<div className={styles.heroContent}>
					<p className={styles.eyebrow}>Pluto Booking</p>
					<h1>Find the stay or rental that fits your next move.</h1>
					<p>
						Search verified cars, apartments, hotel rooms, and AirBnB-style
						stays from trusted Pluto Booking partners.
					</p>
				</div>

				<form className={styles.searchPanel} onSubmit={submitSearch}>
					<div className={styles.categoryTabs} aria-label="Search category">
						{searchCategories.map((category) => {
							const Icon = category.icon;

							return (
								<button
									key={category.id}
									type="button"
									className={styles.categoryTab}
									data-active={activeCategory === category.id}
									data-coming-soon={category.comingSoon ? "true" : "false"}
									onClick={() => selectCategory(category)}
								>
									<Icon aria-hidden="true" />
									<span>{category.label}</span>
									{category.comingSoon ? <small>Coming soon</small> : null}
								</button>
							);
						})}
					</div>

					<div className={styles.searchFields}>
						<label className={styles.searchField}>
							<span>Search</span>
							<strong>{activeSearchCategory.shortLabel}</strong>
							<input
								type="search"
								value={search}
								placeholder={activeSearchCategory.placeholder}
								onChange={(event) => setSearch(event.target.value)}
								disabled={activeSearchCategory.comingSoon}
							/>
						</label>

						<button
							type="button"
							className={styles.dateField}
							onClick={() => setIsDateDialogOpen(true)}
						>
							<CalendarDays aria-hidden="true" />
							<span>Dates</span>
							<strong>{formatDateRange(dateRange)}</strong>
						</button>

						<label className={styles.guestField}>
							<Users aria-hidden="true" />
							<span>Guests</span>
							<select
								value={guests}
								onChange={(event) => setGuests(Number(event.target.value))}
								disabled={
									activeCategory === "cars" || activeCategory === "flight"
								}
							>
								{[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
									<option key={value} value={value}>
										{value} {value === 1 ? "guest" : "guests"}
									</option>
								))}
							</select>
						</label>

						<Button type="submit" className={styles.searchButton}>
							<Search aria-hidden="true" />
							{activeSearchCategory.comingSoon
								? "Coming soon"
								: `Search ${activeSearchCategory.shortLabel}`}
							<ArrowRight aria-hidden="true" />
						</Button>
					</div>
				</form>
			</section>

			<DateRangeDialog
				open={isDateDialogOpen}
				dateRange={dateRange}
				onOpenChange={setIsDateDialogOpen}
				onDateRangeChange={setDateRange}
			/>
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

function DateRangeDialog({
	open,
	dateRange,
	onOpenChange,
	onDateRangeChange,
}: {
	open: boolean;
	dateRange: DateRange | undefined;
	onOpenChange: (open: boolean) => void;
	onDateRangeChange: (range: DateRange | undefined) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={styles.dateDialog}>
				<DialogHeader>
					<DialogTitle>Choose travel dates</DialogTitle>
					<DialogDescription>
						Select a start and end date. These dates will travel with your
						search.
					</DialogDescription>
				</DialogHeader>

				<div className={styles.datePreview}>
					<div>
						<span>Start</span>
						<strong>
							{dateRange?.from
								? format(dateRange.from, "MMM d, yyyy")
								: "Add date"}
						</strong>
					</div>
					<div>
						<span>End</span>
						<strong>
							{dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "Add date"}
						</strong>
					</div>
				</div>

				<div className={styles.calendarShell}>
					<Calendar
						mode="range"
						numberOfMonths={2}
						selected={dateRange}
						onSelect={onDateRangeChange}
						disabled={{ before: today }}
						showOutsideDays={false}
						className={styles.calendar}
					/>
				</div>

				<DialogFooter className={styles.dateDialogFooter}>
					<Button
						type="button"
						variant="outline"
						onClick={() => onDateRangeChange(defaultDateRange)}
					>
						<CalendarDays aria-hidden="true" />
						Reset dates
					</Button>
					<Button type="button" onClick={() => onOpenChange(false)}>
						<ArrowRight aria-hidden="true" />
						Use dates
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function formatDateRange(range: DateRange | undefined): string {
	if (!range?.from) {
		return "Add dates";
	}

	if (!range.to) {
		return format(range.from, "MMM d");
	}

	return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d")}`;
}

function getUserInitials(value: string) {
	const [first = "P", second = "B"] = value.trim().split(/\s+/).filter(Boolean);

	return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
