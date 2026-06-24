"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  MessageSquareText,
  PlaneTakeoff,
  RefreshCcw,
  Search,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CustomerPortalShell } from "@/components/account/customer-portal-shell";
import { PortalAccessBoundary } from "@/components/portal/portal-access-boundary";
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
import { Textarea } from "@/components/ui/textarea";
import { ApiRequestError } from "@/services/api/errors";
import {
  getMyFlightRequest,
  listMyFlightRequests,
  sendFlightRequestMessage,
  type FlightRequestDetail,
  type FlightRequestOrderBy,
  type FlightRequestSortOrder,
  type FlightRequestStatus,
  type FlightRequestSummary,
} from "@/services/api/flight-requests";
import styles from "./customer-flight-requests-page.module.css";

const REQUESTS_LIMIT = 8;
const FLIGHT_REQUESTS_QUERY_KEY = ["customer-flight-requests"] as const;

const statusOptions: Array<{
  value: "ALL" | FlightRequestStatus;
  label: string;
}> = [
  { value: "ALL", label: "All statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "SEARCHING", label: "Searching" },
  { value: "NEEDS_INFORMATION", label: "Needs information" },
  { value: "QUOTE_READY", label: "Quote ready" },
  { value: "PAYMENT_PENDING", label: "Payment pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "FAILED", label: "Failed" },
];

const sortOptions: Array<{ value: FlightRequestOrderBy; label: string }> = [
  { value: "createdAt", label: "Created date" },
  { value: "updatedAt", label: "Last update" },
  { value: "status", label: "Status" },
];

const orderOptions: Array<{ value: FlightRequestSortOrder; label: string }> = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

export function CustomerFlightRequestsPage() {
  return (
    <PortalAccessBoundary allowedRole="CUSTOMER">
      {(user) => (
        <CustomerPortalShell user={user}>
          <CustomerFlightRequestsContent />
        </CustomerPortalShell>
      )}
    </PortalAccessBoundary>
  );
}

function CustomerFlightRequestsContent() {
  const queryClient = useQueryClient();
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"ALL" | FlightRequestStatus>("ALL");
  const [orderBy, setOrderBy] = useState<FlightRequestOrderBy>("createdAt");
  const [order, setOrder] = useState<FlightRequestSortOrder>("desc");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [messageBody, setMessageBody] = useState("");
  const requestsQuery = useQuery({
    queryKey: [
      ...FLIGHT_REQUESTS_QUERY_KEY,
      { page, search, status, orderBy, order, limit: REQUESTS_LIMIT },
    ],
    queryFn: () =>
      listMyFlightRequests({
        page,
        limit: REQUESTS_LIMIT,
        search: search || undefined,
        status: status === "ALL" ? undefined : status,
        orderBy,
        order,
      }),
    staleTime: 30_000,
  });
  const detailQuery = useQuery({
    queryKey: [...FLIGHT_REQUESTS_QUERY_KEY, "detail", selectedRequestId],
    queryFn: () => getMyFlightRequest(selectedRequestId ?? ""),
    enabled: Boolean(selectedRequestId),
    staleTime: 20_000,
  });
  const messageMutation = useMutation({
    mutationFn: () =>
      sendFlightRequestMessage(selectedRequestId ?? "", {
        body: messageBody.trim(),
      }),
    onSuccess: (response) => {
      toast.success(response.message, {
        description: "Our travel team will see your update on this request.",
      });
      setMessageBody("");
      void queryClient.invalidateQueries({
        queryKey: [...FLIGHT_REQUESTS_QUERY_KEY, "detail", selectedRequestId],
      });
    },
    onError: (error) => {
      const message =
        error instanceof ApiRequestError
          ? error.message
          : "Message could not be sent. Please try again.";
      toast.error("Message was not sent", { description: message });
    },
  });
  const requests = requestsQuery.data?.items ?? [];
  const meta = requestsQuery.data?.meta;
  const pageNumbers = useMemo(
    () => getPaginationItems(page, meta?.totalPages ?? 1),
    [page, meta?.totalPages],
  );

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(draftSearch.trim());
    setPage(1);
  }

  function resetFilters() {
    setDraftSearch("");
    setSearch("");
    setStatus("ALL");
    setOrderBy("createdAt");
    setOrder("desc");
    setPage(1);
  }

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!messageBody.trim() || !selectedRequestId) {
      return;
    }

    messageMutation.mutate();
  }

  if (requestsQuery.isPending) {
    return <CustomerFlightRequestsSkeleton />;
  }

  return (
    <section className={styles.page} aria-labelledby="customer-flight-requests">
      <header className={styles.header}>
        <div>
          <span>
            <PlaneTakeoff aria-hidden="true" />
            Managed travel
          </span>
          <h1 id="customer-flight-requests">Flight requests</h1>
          <p>
            Track manual flight booking requests, staff updates, quotes, and
            payment progress in one place.
          </p>
        </div>
        <strong>{meta?.total ?? 0} requests</strong>
      </header>

      <form className={styles.toolbar} onSubmit={handleSearch}>
        <Input
          type="search"
          value={draftSearch}
          icon={<Search aria-hidden="true" />}
          placeholder="Search request number or airport code..."
          shellClassName={styles.searchInput}
          onChange={(event) => setDraftSearch(event.target.value)}
        />
        <div className={styles.controls}>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as "ALL" | FlightRequestStatus);
              setPage(1);
            }}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue>
                {statusOptions.find((option) => option.value === status)
                  ?.label ?? "Status"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectGroup>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={orderBy}
            onValueChange={(value) => {
              setOrderBy(value as FlightRequestOrderBy);
              setPage(1);
            }}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue>
                {sortOptions.find((option) => option.value === orderBy)
                  ?.label ?? "Sort"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectGroup>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={order}
            onValueChange={(value) => {
              setOrder(value as FlightRequestSortOrder);
              setPage(1);
            }}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue>
                {orderOptions.find((option) => option.value === order)?.label ??
                  "Order"}
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
          <Button type="submit" className={styles.primaryButton}>
            <SlidersHorizontal aria-hidden="true" />
            Filter
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

      {requestsQuery.isError ? (
        <StateCard
          title="Flight requests unavailable"
          description="We could not retrieve your flight requests. Please try again."
        />
      ) : requests.length === 0 ? (
        <StateCard
          title="No flight requests yet"
          description="Start a managed flight request and it will appear here once submitted."
        />
      ) : (
        <div className={styles.contentGrid}>
          <div className={styles.requestList}>
            {requests.map((request) => (
              <FlightRequestCard
                key={request.id}
                request={request}
                isSelected={selectedRequestId === request.id}
                onSelect={() => setSelectedRequestId(request.id)}
              />
            ))}
          </div>

          <FlightRequestDetailPanel
            request={detailQuery.data}
            isLoading={detailQuery.isFetching}
            onSendMessage={handleSendMessage}
            messageBody={messageBody}
            onMessageChange={setMessageBody}
            isSending={messageMutation.isPending}
          />
        </div>
      )}

      {(meta?.totalPages ?? 1) > 1 ? (
        <nav className={styles.pagination} aria-label="Flight request pages">
          <Button
            type="button"
            variant="outline"
            className={styles.paginationButton}
            disabled={!meta?.hasPreviousPage}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ArrowLeft aria-hidden="true" />
            Previous
          </Button>
          <div className={styles.pageNumbers}>
            {pageNumbers.map((item) =>
              item === "…" ? (
                <span key={`ellipsis-${item}`}>...</span>
              ) : (
                <button
                  key={item}
                  type="button"
                  data-active={item === page}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ),
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            className={styles.paginationButton}
            disabled={!meta?.hasNextPage}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
            <ArrowRight aria-hidden="true" />
          </Button>
        </nav>
      ) : null}
    </section>
  );
}

function FlightRequestCard({
  request,
  isSelected,
  onSelect,
}: {
  request: FlightRequestSummary;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const firstSegment = request.segments[0];
  const lastSegment = request.segments[request.segments.length - 1];

  return (
    <button
      type="button"
      className={styles.requestCard}
      data-selected={isSelected}
      onClick={onSelect}
    >
      <span
        className={styles.statusBadge}
        data-tone={statusTone(request.status)}
      >
        {formatStatus(request.status)}
      </span>
      <strong>{request.requestNo}</strong>
      <span className={styles.routeLine}>
        {formatSegmentRoute(firstSegment)}
      </span>
      <small>
        {formatDate(firstSegment?.departureDate)}{" "}
        {request.tripType === "ROUND_TRIP" && lastSegment
          ? `- ${formatDate(lastSegment.departureDate)}`
          : ""}
      </small>
      <div>
        <span>{formatStatus(request.paymentStatus)}</span>
        <span>{request._count?.messages ?? 0} messages</span>
      </div>
    </button>
  );
}

function FlightRequestDetailPanel({
  request,
  isLoading,
  messageBody,
  onMessageChange,
  onSendMessage,
  isSending,
}: {
  request?: FlightRequestDetail;
  isLoading: boolean;
  messageBody: string;
  onMessageChange: (value: string) => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  isSending: boolean;
}) {
  if (isLoading) {
    return (
      <aside className={styles.detailPanel}>
        <LoaderCircle className={styles.spinner} aria-hidden="true" />
        <h2>Opening request</h2>
        <p>Loading secure flight request details.</p>
      </aside>
    );
  }

  if (!request) {
    return (
      <aside className={styles.detailPanel}>
        <PlaneTakeoff aria-hidden="true" />
        <h2>Select a request</h2>
        <p>Choose a flight request to view trip details and team messages.</p>
      </aside>
    );
  }

  return (
    <aside className={styles.detailPanel}>
      <header>
        <span
          className={styles.statusBadge}
          data-tone={statusTone(request.status)}
        >
          {formatStatus(request.status)}
        </span>
        <h2>{request.requestNo}</h2>
        <p>
          {request.segments
            .map((segment) => formatSegmentRoute(segment))
            .join(" / ")}
        </p>
      </header>

      <div className={styles.detailStats}>
        <span>
          <strong>{formatStatus(request.cabinClass)}</strong>
          <small>Cabin</small>
        </span>
        <span>
          <strong>
            {request.travelers?.length ?? request._count?.travelers ?? 1}
          </strong>
          <small>Travelers</small>
        </span>
        <span>
          <strong>{request.currency}</strong>
          <small>Currency</small>
        </span>
      </div>

      <div className={styles.timeline}>
        <h3>Status timeline</h3>
        {request.statusHistory.slice(0, 5).map((history) => (
          <div key={history.id}>
            <i aria-hidden="true" />
            <span>
              <strong>{formatStatus(history.toStatus)}</strong>
              <small>{formatDateTime(history.createdAt)}</small>
            </span>
          </div>
        ))}
      </div>

      <div className={styles.messages}>
        <h3>Messages</h3>
        {request.messages.length === 0 ? (
          <p>No messages yet. Updates from Pluto Booking will appear here.</p>
        ) : (
          request.messages.slice(-4).map((message) => (
            <article key={message.id}>
              <strong>{message.sender?.fullName ?? "Pluto Booking"}</strong>
              <small>{formatDateTime(message.createdAt)}</small>
              <p>{message.body}</p>
            </article>
          ))
        )}
      </div>

      <form className={styles.messageForm} onSubmit={onSendMessage}>
        <Textarea
          value={messageBody}
          placeholder="Send a secure update to the travel team..."
          onChange={(event) => onMessageChange(event.target.value)}
        />
        <Button
          type="submit"
          className={styles.primaryButton}
          disabled={!messageBody.trim() || isSending}
        >
          {isSending ? (
            <LoaderCircle className={styles.spinner} aria-hidden="true" />
          ) : (
            <Send aria-hidden="true" />
          )}
          Send message
        </Button>
      </form>
    </aside>
  );
}

function CustomerFlightRequestsSkeleton() {
  return (
    <section className={styles.page} aria-label="Loading flight requests">
      <div className={`${styles.header} ${styles.skeletonHeader}`} />
      <div className={`${styles.toolbar} ${styles.skeletonToolbar}`} />
      <div className={styles.contentGrid}>
        <div className={styles.requestList}>
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className={`${styles.requestCard} ${styles.skeletonCard}`}
            />
          ))}
        </div>
        <div className={`${styles.detailPanel} ${styles.skeletonPanel}`} />
      </div>
    </section>
  );
}

function StateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={styles.state}>
      <PlaneTakeoff aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  return [...pages]
    .sort((first, second) => first - second)
    .reduce<Array<number | "…">>((items, pageNumber, index, pagesList) => {
      if (index > 0 && pageNumber - pagesList[index - 1] > 1) {
        items.push("…");
      }
      items.push(pageNumber);
      return items;
    }, []);
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function statusTone(status: string) {
  if (["CONFIRMED", "COMPLETED", "PAID"].includes(status)) return "success";
  if (["CANCELLED", "REJECTED", "FAILED", "EXPIRED"].includes(status)) {
    return "danger";
  }
  if (
    ["NEEDS_INFORMATION", "PAYMENT_PENDING", "QUOTE_READY"].includes(status)
  ) {
    return "attention";
  }
  return "pending";
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Date pending";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatSegmentRoute(
  segment?: Pick<
    FlightRequestSummary["segments"][number],
    | "originAirportCode"
    | "originAirportName"
    | "destinationAirportCode"
    | "destinationAirportName"
  >,
) {
  if (!segment) {
    return "Route pending";
  }

  const origin = segment.originAirportName
    ? `${segment.originAirportName} (${segment.originAirportCode})`
    : segment.originAirportCode;
  const destination = segment.destinationAirportName
    ? `${segment.destinationAirportName} (${segment.destinationAirportCode})`
    : segment.destinationAirportCode;

  return `${origin} to ${destination}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
