"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileSearch,
  RefreshCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  if (auditLogsQuery.isPending) {
    return <UserAuditLogsSkeleton />;
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
            <Select
              value={orderBy}
              onValueChange={(value) => {
                setOrderBy(value as UserAuditOrderBy);
                setPage(1);
              }}
            >
              <SelectTrigger className={styles.selectTrigger}>
                <SelectValue>
                  {orderByOptions.find((option) => option.value === orderBy)
                    ?.label ?? "Sort"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                <SelectGroup>
                  {orderByOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>
          <label>
            <span>Order</span>
            <Select
              value={order}
              onValueChange={(value) => {
                setOrder(value as UserAuditOrder);
                setPage(1);
              }}
            >
              <SelectTrigger className={styles.selectTrigger}>
                <SelectValue>
                  {orderOptions.find((option) => option.value === order)
                    ?.label ?? "Order"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                <SelectGroup>
                  {orderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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

      {auditLogsQuery.isError ? (
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
          <UserAuditLogsTable logs={items} />

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

function UserAuditLogsTable({ logs }: { logs: UserAuditLog[] }) {
  return (
    <section className={styles.tablePanel}>
      <Table className={styles.auditTable}>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Request</TableHead>
            <TableHead>Context</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <div className={styles.eventCell}>
                  <strong>{formatAction(log.action)}</strong>
                  <span>{log.message || "Recorded account activity."}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className={styles.badgeStack}>
                  <Badge className={styles[`outcome${log.outcome}`]}>
                    {formatEnum(log.outcome)}
                  </Badge>
                  <Badge className={styles[`severity${log.severity}`]}>
                    {formatEnum(log.severity)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className={styles.entityCell}>
                  <strong>
                    {log.entityName || log.entityType || "Unscoped"}
                  </strong>
                  <span>{log.entityId || formatEnum(log.category)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className={styles.requestCell}>
                  <strong>{log.method || "EVENT"}</strong>
                  <span>{log.endpoint || "No endpoint"}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className={styles.contextCell}>
                  <strong>{log.ipAddress || "IP hidden"}</strong>
                  <span>
                    {formatEnum(log.deviceType)} ·{" "}
                    {log.fieldChanges.length
                      ? `${log.fieldChanges.length} changes`
                      : "No changes"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <time className={styles.timeCell} dateTime={log.createdAt}>
                  {formatDateTime(log.createdAt)}
                </time>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
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
    <section
      className={styles.page}
      aria-label="Loading customer audit logs"
      aria-busy="true"
    >
      <header className={`${styles.header} ${styles.skeletonHeader}`}>
        <div>
          <span>
            <Skeleton />
          </span>
          <Skeleton />
          <Skeleton />
        </div>
        <Skeleton />
      </header>

      <div className={`${styles.toolbar} ${styles.skeletonToolbar}`}>
        <Skeleton />
        <div className={styles.skeletonControls}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </div>

      <section className={styles.tablePanel}>
        <div className={styles.skeletonTableHeader}>
          {["Event", "Status", "Entity", "Request", "Context", "Time"].map(
            (label) => (
              <span key={label}>{label}</span>
            ),
          )}
        </div>
        {Array.from({ length: AUDIT_LOG_LIMIT }).map((_, rowIndex) => (
          <div key={rowIndex} className={styles.skeletonTableRow}>
            <div className={styles.skeletonEventCell}>
              <Skeleton />
              <Skeleton />
            </div>
            <div className={styles.skeletonBadgeStack}>
              <Skeleton />
              <Skeleton />
            </div>
            <div className={styles.skeletonTextCell}>
              <Skeleton />
              <Skeleton />
            </div>
            <div className={styles.skeletonRequestCell}>
              <Skeleton />
              <Skeleton />
            </div>
            <div className={styles.skeletonTextCell}>
              <Skeleton />
              <Skeleton />
            </div>
            <div className={styles.skeletonTimeCell}>
              <Skeleton />
              <Skeleton />
            </div>
          </div>
        ))}
      </section>
      <nav className={styles.skeletonPagination} aria-hidden="true">
        <Skeleton />
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
        <Skeleton />
      </nav>
    </section>
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
