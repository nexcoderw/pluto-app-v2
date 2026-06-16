"use client";

import type { CSSProperties, FormEvent } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  Clock3,
  Heart,
  RefreshCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCustomerDashboardAnalytics,
  getCustomerDashboardMetrics,
  type CustomerDashboardAnalyticsResponse,
  type CustomerDashboardMetricsResponse,
  type CustomerDashboardRequest,
  type CustomerDashboardTimeframe,
} from "@/services/api/customer-dashboard";
import type {
  BookingProductCategory,
  BookingStatus,
} from "@/services/api/bookings";
import type { CurrencyCode } from "@/services/api/listing-options";
import type { UserAuthProfile } from "@/services/api/auth";
import { CustomerDashboardSkeleton } from "./customer-dashboard-skeleton";
import styles from "./customer-dashboard-page.module.css";

type CustomerDashboardPageProps = {
  user: UserAuthProfile;
};

type DashboardComparison = NonNullable<
  CustomerDashboardMetricsResponse["comparison"]
>;

type DashboardFilters = {
  timeframe: CustomerDashboardTimeframe;
  category: "ALL" | BookingProductCategory;
  status: "ALL" | BookingStatus;
  currency: "ALL" | CurrencyCode;
  dateField: NonNullable<CustomerDashboardRequest["dateField"]>;
  search: string;
};

const timeframeOptions: Array<{
  label: string;
  value: CustomerDashboardTimeframe;
}> = [
  { label: "30 days", value: "30d" },
  { label: "7 days", value: "7d" },
  { label: "90 days", value: "90d" },
  { label: "180 days", value: "180d" },
  { label: "Year to date", value: "ytd" },
];

const categoryOptions: Array<{
  label: string;
  value: "ALL" | BookingProductCategory;
}> = [
  { label: "All categories", value: "ALL" },
  { label: "Cars", value: "CAR" },
  { label: "Apartments", value: "APARTMENT" },
  { label: "Hotel rooms", value: "HOTEL_ROOM" },
  { label: "Airbnb", value: "AIRBNB_HOUSE" },
];

const statusOptions: Array<{ label: string; value: "ALL" | BookingStatus }> = [
  { label: "All statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED_BY_CUSTOMER" },
];

const currencyOptions: Array<{ label: string; value: "ALL" | CurrencyCode }> = [
  { label: "All currency", value: "ALL" },
  { label: "RWF", value: "RWF" },
  { label: "USD", value: "USD" },
];

const dateFieldOptions: Array<{
  label: string;
  value: NonNullable<CustomerDashboardRequest["dateField"]>;
}> = [
  { label: "Activity date", value: "createdAt" },
  { label: "Trip start", value: "startDate" },
  { label: "Trip end", value: "endDate" },
];

export function CustomerDashboardPage({ user }: CustomerDashboardPageProps) {
  const [filters, setFilters] = useState<DashboardFilters>({
    timeframe: "30d",
    category: "ALL",
    status: "ALL",
    currency: "ALL",
    dateField: "createdAt",
    search: "",
  });
  const [searchDraft, setSearchDraft] = useState("");
  const params = useMemo(() => normalizeFilters(filters), [filters]);
  const metricsQuery = useQuery({
    queryKey: ["customer-dashboard", "metrics", params],
    queryFn: () => getCustomerDashboardMetrics(params),
    staleTime: 45_000,
    gcTime: 5 * 60_000,
  });
  const analyticsQuery = useQuery({
    queryKey: ["customer-dashboard", "analytics", params],
    queryFn: () => getCustomerDashboardAnalytics(params),
    staleTime: 45_000,
    gcTime: 5 * 60_000,
  });
  const isLoading = metricsQuery.isPending || analyticsQuery.isPending;
  const isError = metricsQuery.isError || analyticsQuery.isError;

  function updateFilter<Key extends keyof DashboardFilters>(
    key: Key,
    value: DashboardFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilter("search", searchDraft.trim());
  }

  function handleReset() {
    setSearchDraft("");
    setFilters({
      timeframe: "30d",
      category: "ALL",
      status: "ALL",
      currency: "ALL",
      dateField: "createdAt",
      search: "",
    });
  }

  if (isLoading) {
    return <CustomerDashboardSkeleton />;
  }

  if (isError || !metricsQuery.data || !analyticsQuery.data) {
    return (
      <section className={styles.errorState}>
        <span>
          <ShieldCheck aria-hidden="true" />
        </span>
        <h1>Dashboard temporarily unavailable</h1>
        <p>
          We could not load your customer analytics. Refresh the dashboard or
          try again after your connection is stable.
        </p>
        <Button
          type="button"
          onClick={() => {
            void metricsQuery.refetch();
            void analyticsQuery.refetch();
          }}
        >
          <RefreshCcw aria-hidden="true" />
          Retry dashboard
        </Button>
      </section>
    );
  }

  return (
    <CustomerDashboardView
      user={user}
      filters={filters}
      searchDraft={searchDraft}
      metrics={metricsQuery.data}
      analytics={analyticsQuery.data}
      isRefreshing={metricsQuery.isFetching || analyticsQuery.isFetching}
      onSearchDraftChange={setSearchDraft}
      onSearch={handleSearch}
      onReset={handleReset}
      onFilterChange={updateFilter}
      onRefresh={() => {
        void metricsQuery.refetch();
        void analyticsQuery.refetch();
      }}
    />
  );
}

function CustomerDashboardView({
  user,
  filters,
  searchDraft,
  metrics,
  analytics,
  isRefreshing,
  onSearchDraftChange,
  onSearch,
  onReset,
  onFilterChange,
  onRefresh,
}: {
  user: UserAuthProfile;
  filters: DashboardFilters;
  searchDraft: string;
  metrics: CustomerDashboardMetricsResponse;
  analytics: CustomerDashboardAnalyticsResponse;
  isRefreshing: boolean;
  onSearchDraftChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onFilterChange: <Key extends keyof DashboardFilters>(
    key: Key,
    value: DashboardFilters[Key],
  ) => void;
  onRefresh: () => void;
}) {
  const bookingValue = metrics.metrics.bookingValue[0];
  const bookingComparison = metrics.comparison?.bookings;
  const valueComparison = metrics.comparison?.bookingValue[0];
  const totalValue = bookingValue
    ? formatMoney(bookingValue.totalAmount, bookingValue.currency)
    : formatMoney("0", filters.currency === "ALL" ? "RWF" : filters.currency);
  const trendMax = Math.max(
    1,
    ...analytics.analytics.trend.map((item) => item.count),
  );
  const categoryTotal = analytics.analytics.categoryBreakdown.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const bestCategory = [...analytics.analytics.categoryBreakdown].sort(
    (left, right) => right.count - left.count,
  )[0];

  return (
    <section className={styles.page} aria-labelledby="customer-dashboard-title">
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <Sparkles aria-hidden="true" />
            Customer analytics
          </span>
          <h1 id="customer-dashboard-title">
            Welcome back, {firstName(user.fullName)}
          </h1>
          <p>
            A clear view of your bookings, saved listings, reviews, and upcoming
            trips for the selected period.
          </p>
        </div>

        <form className={styles.searchPanel} onSubmit={onSearch}>
          <label htmlFor="dashboard-search">Search dashboard</label>
          <div>
            <Search aria-hidden="true" />
            <input
              id="dashboard-search"
              value={searchDraft}
              onChange={(event) => onSearchDraftChange(event.target.value)}
              placeholder="Booking no, Kigali, apartment..."
            />
            <Button type="submit">
              <SlidersHorizontal aria-hidden="true" />
              Apply
            </Button>
          </div>
        </form>
      </header>

      <div className={styles.filterBar}>
        <DashboardSelect
          label="Period"
          value={filters.timeframe}
          options={timeframeOptions}
          onValueChange={(value) => onFilterChange("timeframe", value)}
        />
        <DashboardSelect
          label="Category"
          value={filters.category}
          options={categoryOptions}
          onValueChange={(value) => onFilterChange("category", value)}
        />
        <DashboardSelect
          label="Status"
          value={filters.status}
          options={statusOptions}
          onValueChange={(value) => onFilterChange("status", value)}
        />
        <DashboardSelect
          label="Currency"
          value={filters.currency}
          options={currencyOptions}
          onValueChange={(value) => onFilterChange("currency", value)}
        />
        <DashboardSelect
          label="Date"
          value={filters.dateField}
          options={dateFieldOptions}
          onValueChange={(value) => onFilterChange("dateField", value)}
        />
        <Button
          type="button"
          variant="outline"
          className={styles.resetButton}
          onClick={onReset}
        >
          <RefreshCcw aria-hidden="true" />
          Reset
        </Button>
      </div>

      <section className={styles.overviewGrid}>
        <article className={styles.salesPanel}>
          <div className={styles.panelHeader}>
            <span>
              <BarChart3 aria-hidden="true" />
              Booking movement
            </span>
            <small>{periodLabel(metrics.period)}</small>
          </div>
          <div className={styles.valueLine}>
            <strong>{totalValue}</strong>
            <span>{bookingValue?.count ?? 0} value bookings</span>
          </div>
          <div className={styles.trendChart} aria-label="Booking trend">
            {analytics.analytics.trend.length ? (
              analytics.analytics.trend.slice(-12).map((item) => (
                <span key={item.date}>
                  <i
                    style={
                      {
                        "--bar-size": `${(item.count / trendMax) * 100}%`,
                      } as CSSProperties
                    }
                  />
                  <small>{dayLabel(item.date)}</small>
                </span>
              ))
            ) : (
              <div className={styles.noChartData}>No booking movement yet.</div>
            )}
          </div>
        </article>

        <div className={styles.metricGrid}>
          <MetricCard
            icon={CalendarCheck2}
            label="Bookings"
            value={String(metrics.metrics.bookings.total)}
            hint={comparisonLabel(bookingComparison)}
          />
          <MetricCard
            icon={WalletCards}
            label="Spend"
            value={totalValue}
            hint={comparisonLabel(valueComparison)}
          />
          <MetricCard
            icon={Heart}
            label="Favorites"
            value={String(metrics.metrics.favorites.totalSaved)}
            hint={`${metrics.metrics.favorites.addedInPeriod} added in period`}
          />
          <MetricCard
            icon={Star}
            label="Rating"
            value={
              metrics.metrics.reviews.averageRating
                ? metrics.metrics.reviews.averageRating.toFixed(1)
                : "New"
            }
            hint={`${metrics.metrics.reviews.total} customer reviews`}
          />
        </div>
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.statusPanel}>
          <div className={styles.panelHeader}>
            <span>
              <ShieldCheck aria-hidden="true" />
              Booking status
            </span>
            <small>{metrics.metrics.bookings.upcoming} upcoming</small>
          </div>
          <div className={styles.statusList}>
            {statusRows(metrics).map((item) => (
              <span key={item.label}>
                <small>{item.label}</small>
                <i>
                  <b
                    style={
                      {
                        "--progress": `${item.percent}%`,
                      } as CSSProperties
                    }
                  />
                </i>
                <strong>{item.value}</strong>
              </span>
            ))}
          </div>
        </article>

        <article className={styles.categoryPanel}>
          <div className={styles.panelHeader}>
            <span>
              <BarChart3 aria-hidden="true" />
              Category demand
            </span>
            <small>
              {bestCategory ? categoryLabel(bestCategory.category) : "No data"}
            </small>
          </div>
          <div className={styles.categoryBars}>
            {analytics.analytics.categoryBreakdown.map((item) => {
              const percent = categoryTotal
                ? Math.round((item.count / categoryTotal) * 100)
                : 0;

              return (
                <span key={item.category}>
                  <small>{categoryLabel(item.category)}</small>
                  <i
                    style={
                      {
                        "--progress": `${percent}%`,
                      } as CSSProperties
                    }
                  >
                    <b />
                  </i>
                  <strong>{item.count}</strong>
                </span>
              );
            })}
          </div>
        </article>

        <article className={styles.tripsPanel}>
          <div className={styles.panelHeader}>
            <span>
              <Clock3 aria-hidden="true" />
              Upcoming trips
            </span>
            <Link href="/account/bookings">
              View all
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          {metrics.metrics.nextTrips.length ? (
            <div className={styles.tripList}>
              {metrics.metrics.nextTrips.map((trip) => (
                <Link key={trip.id} href="/account/bookings">
                  <span
                    className={styles.tripImage}
                    style={
                      trip.listing.coverImageUrl
                        ? ({
                            "--trip-image": `url("${trip.listing.coverImageUrl}")`,
                          } as CSSProperties)
                        : undefined
                    }
                    aria-hidden="true"
                  />
                  <span>
                    <strong>{trip.listing.title}</strong>
                    <small>
                      {dateRangeLabel(trip.startDate, trip.endDate)} ·{" "}
                      {categoryLabel(trip.listing.category)}
                    </small>
                  </span>
                  <b>{formatMoney(trip.totalAmount, trip.currency)}</b>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyMini}>
              <CalendarCheck2 aria-hidden="true" />
              <strong>No upcoming trips</strong>
              <p>Book a listing and your next stay appears here.</p>
            </div>
          )}
        </article>

        <article className={styles.activityPanel}>
          <div className={styles.panelHeader}>
            <span>
              <Sparkles aria-hidden="true" />
              Recent activity
            </span>
            <button type="button" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCcw aria-hidden="true" />
              {isRefreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>
          {analytics.analytics.recentActivity.length ? (
            <div className={styles.activityList}>
              {analytics.analytics.recentActivity.slice(0, 8).map((item) => (
                <span key={`${item.type}-${item.id}`}>
                  <i>{activityInitial(item.type)}</i>
                  <span>
                    <strong>{item.title}</strong>
                    <small>
                      {activityLabel(item.type)} ·{" "}
                      {categoryLabel(item.category)} · {timeAgo(item.createdAt)}
                    </small>
                  </span>
                  {item.amount && item.currency ? (
                    <b>{formatMoney(item.amount, item.currency)}</b>
                  ) : null}
                </span>
              ))}
            </div>
          ) : (
            <div className={styles.emptyMini}>
              <Sparkles aria-hidden="true" />
              <strong>No activity yet</strong>
              <p>Favorites, bookings, and reviews will build your timeline.</p>
            </div>
          )}
        </article>
      </section>
    </section>
  );
}

function DashboardSelect<Value extends string>({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: Value;
  options: Array<{ label: string; value: Value }>;
  onValueChange: (value: Value) => void;
}) {
  return (
    <label className={styles.filterControl}>
      <span>{label}</span>
      <Select
        value={value}
        onValueChange={(nextValue) => onValueChange(nextValue as Value)}
      >
        <SelectTrigger className={styles.selectTrigger}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={styles.selectContent}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof CalendarCheck2;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className={styles.metricCard}>
      <span>
        <Icon aria-hidden="true" />
      </span>
      <small>{label}</small>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  );
}

function normalizeFilters(filters: DashboardFilters): CustomerDashboardRequest {
  return {
    timeframe: filters.timeframe,
    dateField: filters.dateField,
    category: filters.category === "ALL" ? undefined : filters.category,
    status: filters.status === "ALL" ? undefined : filters.status,
    currency: filters.currency === "ALL" ? undefined : filters.currency,
    search: filters.search || undefined,
    compare: true,
  };
}

function statusRows(data: CustomerDashboardMetricsResponse) {
  const total = Math.max(1, data.metrics.bookings.total);
  const rows = [
    { label: "Pending", value: data.metrics.bookings.pending },
    { label: "Confirmed", value: data.metrics.bookings.confirmed },
    { label: "Completed", value: data.metrics.bookings.completed },
    { label: "Cancelled", value: data.metrics.bookings.cancelled },
  ];

  return rows.map((item) => ({
    ...item,
    percent: Math.round((item.value / total) * 100),
  }));
}

function formatMoney(amount: string | number, currency: CurrencyCode) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return currency === "USD" ? "US$0" : "RF 0";
  }

  if (currency === "USD") {
    return `US$${value.toLocaleString("en-US", {
      maximumFractionDigits: 0,
    })}`;
  }

  return `RF ${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function comparisonLabel(
  value:
    | DashboardComparison["bookings"]
    | DashboardComparison["bookingValue"][number]
    | undefined,
) {
  if (!value || value.percentChange === null) {
    return "New period baseline";
  }

  const direction = value.percentChange >= 0 ? "+" : "";

  return `${direction}${value.percentChange}% vs previous`;
}

function periodLabel(period: CustomerDashboardMetricsResponse["period"]) {
  const from = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(period.dateFrom));
  const to = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(period.dateTo));

  return `${from} - ${to}`;
}

function dayLabel(date: string) {
  return new Intl.DateTimeFormat("en", { day: "2-digit" }).format(
    new Date(date),
  );
}

function dateRangeLabel(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(
    new Date(endDate),
  )}`;
}

function categoryLabel(category: BookingProductCategory) {
  const labels = {
    CAR: "Cars",
    APARTMENT: "Apartments",
    HOTEL_ROOM: "Hotel rooms",
    AIRBNB_HOUSE: "Airbnb",
  } satisfies Record<BookingProductCategory, string>;

  return labels[category];
}

function activityLabel(type: "BOOKING" | "FAVORITE" | "REVIEW") {
  const labels = {
    BOOKING: "Booking",
    FAVORITE: "Favorite",
    REVIEW: "Review",
  };

  return labels[type];
}

function activityInitial(type: "BOOKING" | "FAVORITE" | "REVIEW") {
  const labels = {
    BOOKING: "B",
    FAVORITE: "F",
    REVIEW: "R",
  };

  return labels[type];
}

function timeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";

  return `${diffDays} days ago`;
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] || "there";
}
