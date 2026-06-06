"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import {
	ArrowLeft,
	ArrowRight,
	Clock3,
	FileSearch,
	RefreshCcw,
	Search,
	ShieldCheck,
	SlidersHorizontal,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	listUserAuditLogs,
	type ListUserAuditLogsRequest,
	type UserAuditLog,
	type UserAuditOrder,
	type UserAuditOrderBy,
} from "@/services/api/audit-logs";
import styles from "./user-audit-logs-page.module.css";

type UserAuditLogsPageProps = {
	title: string;
	description: string;
	eyebrow: string;
};

const AUDIT_LOG_LIMIT = 12;

const orderByOptions: Array<{ label: string; value: UserAuditOrderBy }> = [
	{ label: "Newest activity", value: "createdAt" },
	{ label: "Action", value: "action" },
	{ label: "Category", value: "category" },
	{ label: "Severity", value: "severity" },
	{ label: "Outcome", value: "outcome" },
	{ label: "Entity", value: "entityType" },
];

const orderOptions: Array<{ label: string; value: UserAuditOrder }> = [
	{ label: "Descending", value: "desc" },
	{ label: "Ascending", value: "asc" },
];

export function UserAuditLogsPage({
	title,
	description,
	eyebrow,
}: UserAuditLogsPageProps) {
	const [page, setPage] = useState(1);
	const [draftSearch, setDraftSearch] = useState("");
	const [search, setSearch] = useState("");
	const [orderBy, setOrderBy] = useState<UserAuditOrderBy>("createdAt");
	const [order, setOrder] = useState<UserAuditOrder>("desc");
	const requestParams = useMemo<ListUserAuditLogsRequest>(
		() => ({
			page,
			limit: AUDIT_LOG_LIMIT,
			search: search || undefined,
			orderBy,
			order,
		}),
		[order, orderBy, page, search],
	);
	const auditLogsQuery = useQuery({
		queryKey: ["user-audit-logs", requestParams],
		queryFn: () => listUserAuditLogs(requestParams),
		staleTime: 20_000,
	});
	const items = auditLogsQuery.data?.items ?? [];
	const meta = auditLogsQuery.data?.meta;
	const totalPages = meta?.totalPages ?? 1;
	const pageNumbers = useMemo(
		() => getPaginationItems(page, totalPages),
		[page, totalPages],
	);

	function applySearch(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSearch(draftSearch.trim());
		setPage(1);
	}

	function resetFilters() {
		setDraftSearch("");
		setSearch("");
		setOrderBy("createdAt");
		setOrder("desc");
		setPage(1);
	}

	return (
		<section className={styles.page} aria-labelledby="user-audit-logs-title">
			<header className={styles.header}>
				<div>
					<span>
						<ShieldCheck aria-hidden="true" />
						{eyebrow}
					</span>
					<h1 id="user-audit-logs-title">{title}</h1>
					<p>{description}</p>
				</div>
				<strong>{meta?.total ?? 0} events</strong>
			</header>

			<form className={styles.toolbar} onSubmit={applySearch}>
				<Input
					type="search"
					value={draftSearch}
					icon={<Search aria-hidden="true" />}
					placeholder="Search action, endpoint, message, IP..."
					shellClassName={styles.searchInput}
					onChange={(event) => setDraftSearch(event.target.value)}
				/>
				<div className={styles.controls}>
					<label>
						<span>Sort by</span>
						<select
							value={orderBy}
							onChange={(event) => {
								setOrderBy(event.target.value as UserAuditOrderBy);
								setPage(1);
							}}
						>
							{orderByOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					<label>
						<span>Order</span>
						<select
							value={order}
							onChange={(event) => {
								setOrder(event.target.value as UserAuditOrder);
								setPage(1);
							}}
						>
							{orderOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					<Button type="submit" className={styles.primaryButton}>
						<SlidersHorizontal aria-hidden="true" />
						Apply
					</Button>
					<Button
						type="button"
						variant="outline"
						className={styles.secondaryButton}
						onClick={resetFilters}
					>
						<RefreshCcw aria-hidden="true" />
						Reset
					</Button>
				</div>
			</form>

			{auditLogsQuery.isPending ? (
				<UserAuditLogsSkeleton />
			) : auditLogsQuery.isError ? (
				<UserAuditLogsState
					icon={<RefreshCcw aria-hidden="true" />}
					title="Audit logs could not load"
					description="Refresh this section to retrieve your latest account activity."
					action={
						<Button
							type="button"
							className={styles.primaryButton}
							onClick={() => void auditLogsQuery.refetch()}
						>
							<RefreshCcw aria-hidden="true" />
							Retry
						</Button>
					}
				/>
			) : items.length ? (
				<>
					<div className={styles.eventList}>
						{items.map((log) => (
							<UserAuditLogCard key={log.id} log={log} />
						))}
					</div>

					{totalPages > 1 ? (
						<nav className={styles.pagination} aria-label="Audit log pages">
							<Button
								type="button"
								variant="outline"
								className={styles.paginationButton}
								disabled={!meta?.hasPreviousPage}
								onClick={() =>
									setPage((currentPage) => Math.max(1, currentPage - 1))
								}
							>
								<ArrowLeft aria-hidden="true" />
								Previous
							</Button>
							<div className={styles.pageNumbers}>
								{pageNumbers.map((pageNumber, index) =>
									pageNumber === "ellipsis" ? (
										<span key={`ellipsis-${index}`}>...</span>
									) : (
										<button
											key={pageNumber}
											type="button"
											data-active={pageNumber === page}
											onClick={() => setPage(pageNumber)}
										>
											{pageNumber}
										</button>
									),
								)}
							</div>
							<Button
								type="button"
								variant="outline"
								className={styles.paginationButton}
								disabled={!meta?.hasNextPage}
								onClick={() =>
									setPage((currentPage) =>
										Math.min(totalPages, currentPage + 1),
									)
								}
							>
								Next
								<ArrowRight aria-hidden="true" />
							</Button>
						</nav>
					) : null}
				</>
			) : (
				<UserAuditLogsState
					icon={<FileSearch aria-hidden="true" />}
					title="No audit events found"
					description="Try a wider search or clear the current filters."
					action={
						<Button
							type="button"
							className={styles.primaryButton}
							onClick={resetFilters}
						>
							<RefreshCcw aria-hidden="true" />
							Clear filters
						</Button>
					}
				/>
			)}
		</section>
	);
}

function UserAuditLogCard({ log }: { log: UserAuditLog }) {
	const hasTechnicalDetails =
		Boolean(log.endpoint) ||
		Boolean(log.ipAddress) ||
		Boolean(log.statusCode) ||
		Boolean(log.errorCode) ||
		Boolean(log.fieldChanges.length);

	return (
		<article className={styles.logCard}>
			<div className={styles.logTime}>
				<Clock3 aria-hidden="true" />
				<span>{formatDateTime(log.createdAt)}</span>
			</div>

			<div className={styles.logMain}>
				<div className={styles.logTitleRow}>
					<div>
						<h2>{formatAction(log.action)}</h2>
						<p>{log.message || "Recorded account activity event."}</p>
					</div>
					<div className={styles.badgeStack}>
						<span data-outcome={log.outcome}>{formatEnum(log.outcome)}</span>
						<span data-severity={log.severity}>{formatEnum(log.severity)}</span>
					</div>
				</div>

				<dl className={styles.detailGrid}>
					<AuditDetail label="Category" value={formatEnum(log.category)} />
					<AuditDetail
						label="Entity"
						value={log.entityName || log.entityType || "Unscoped"}
					/>
					<AuditDetail label="Method" value={log.method || "Event"} />
					<AuditDetail label="Device" value={formatEnum(log.deviceType)} />
				</dl>

				{hasTechnicalDetails ? (
					<div className={styles.technicalPanel}>
						<AuditDetail
							label="Endpoint"
							value={log.endpoint || "Not linked"}
						/>
						<AuditDetail label="IP address" value={log.ipAddress || "Hidden"} />
						<AuditDetail
							label="Status code"
							value={log.statusCode ? String(log.statusCode) : "Not set"}
						/>
						<AuditDetail
							label="Field changes"
							value={
								log.fieldChanges.length
									? `${log.fieldChanges.length} recorded`
									: "None"
							}
						/>
					</div>
				) : null}
			</div>
		</article>
	);
}

function AuditDetail({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt>{label}</dt>
			<dd>{value}</dd>
		</div>
	);
}

function UserAuditLogsState({
	icon,
	title,
	description,
	action,
}: {
	icon: ReactNode;
	title: string;
	description: string;
	action: ReactNode;
}) {
	return (
		<section className={styles.state}>
			<span aria-hidden="true">{icon}</span>
			<h2>{title}</h2>
			<p>{description}</p>
			{action}
		</section>
	);
}

function UserAuditLogsSkeleton() {
	return (
		<div className={styles.eventList} aria-label="Loading audit logs">
			{Array.from({ length: 6 }).map((_, index) => (
				<article key={index} className={styles.logCard} aria-hidden="true">
					<div className={styles.logTime}>
						<Skeleton className={styles.skeletonIcon} />
						<Skeleton className={styles.skeletonTime} />
					</div>
					<div className={styles.logMain}>
						<div className={styles.skeletonTitleRow}>
							<Skeleton />
							<Skeleton />
						</div>
						<Skeleton className={styles.skeletonMessage} />
						<div className={styles.detailGrid}>
							{Array.from({ length: 4 }).map((_, detailIndex) => (
								<Skeleton key={detailIndex} className={styles.skeletonDetail} />
							))}
						</div>
					</div>
				</article>
			))}
		</div>
	);
}

function getPaginationItems(currentPage: number, totalPages: number) {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const pages: Array<number | "ellipsis"> = [1];
	const start = Math.max(2, currentPage - 1);
	const end = Math.min(totalPages - 1, currentPage + 1);

	if (start > 2) {
		pages.push("ellipsis");
	}

	for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
		pages.push(pageNumber);
	}

	if (end < totalPages - 1) {
		pages.push("ellipsis");
	}

	pages.push(totalPages);
	return pages;
}

function formatAction(value: string) {
	return value
		.toLowerCase()
		.split("_")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function formatEnum(value: string) {
	return formatAction(value);
}

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("en-RW", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}
