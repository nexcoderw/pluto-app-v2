import type {
  BookingPaymentStatus,
  BookingProductCategory,
  BookingStatus,
} from "../bookings";
import type { CurrencyCode } from "../listing-options";

export type CustomerDashboardTimeframe =
  | "7d"
  | "30d"
  | "90d"
  | "180d"
  | "365d"
  | "ytd"
  | "custom";

export type CustomerDashboardDateField = "createdAt" | "startDate" | "endDate";

export type CustomerDashboardRequest = {
  timeframe?: CustomerDashboardTimeframe;
  dateField?: CustomerDashboardDateField;
  dateFrom?: string;
  dateTo?: string;
  category?: BookingProductCategory;
  status?: BookingStatus;
  currency?: CurrencyCode;
  search?: string;
  compare?: boolean;
};

export type CustomerDashboardPeriod = {
  timeframe: CustomerDashboardTimeframe;
  dateFrom: string;
  dateTo: string;
  days: number;
  isDefault: boolean;
  dateField?: CustomerDashboardDateField;
};

export type CustomerDashboardFilters = {
  category: BookingProductCategory | null;
  status: BookingStatus | null;
  currency: CurrencyCode | null;
  search: string | null;
  compare: boolean;
};

export type CustomerDashboardCurrencyTotal = {
  currency: CurrencyCode;
  count: number;
  totalAmount: string;
  averageAmount: string;
};

export type CustomerDashboardDelta = {
  current: number;
  previous: number;
  change: number;
  percentChange: number | null;
};

export type CustomerDashboardBookingSummary = {
  id: string;
  bookingNo: string;
  status: BookingStatus;
  paymentStatus: BookingPaymentStatus;
  startDate: string;
  endDate: string;
  guests: number | null;
  quantity: number;
  totalAmount: string;
  currency: CurrencyCode;
  listing: {
    id: string;
    title: string;
    slug: string;
    category: BookingProductCategory;
    city: string;
    country: string;
    coverImageUrl: string | null;
    coverImageAlt: string | null;
  };
};

export type CustomerDashboardMetricsResponse = {
  period: CustomerDashboardPeriod;
  filters: CustomerDashboardFilters;
  metrics: {
    bookings: {
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      upcoming: number;
    };
    bookingValue: CustomerDashboardCurrencyTotal[];
    favorites: {
      totalSaved: number;
      addedInPeriod: number;
    };
    reviews: {
      total: number;
      averageRating: number | null;
      byRating: Array<{
        rating: number;
        count: number;
      }>;
    };
    nextTrips: CustomerDashboardBookingSummary[];
  };
  comparison: {
    previousPeriod: Omit<CustomerDashboardPeriod, "dateField">;
    bookings: CustomerDashboardDelta;
    favoritesAdded: CustomerDashboardDelta;
    bookingValue: Array<{
      currency: CurrencyCode;
      currentAmount: string;
      previousAmount: string;
      current: number;
      previous: number;
      change: number;
      percentChange: number | null;
    }>;
  } | null;
};

export type CustomerDashboardAnalyticsResponse = {
  period: CustomerDashboardPeriod;
  filters: CustomerDashboardFilters;
  analytics: {
    trend: Array<{
      date: string;
      count: number;
      valueByCurrency: CustomerDashboardCurrencyTotal[];
    }>;
    statusBreakdown: Record<BookingStatus, number>;
    categoryBreakdown: Array<{
      category: BookingProductCategory;
      count: number;
    }>;
    spendingByCategory: Array<{
      category: BookingProductCategory;
      totals: CustomerDashboardCurrencyTotal[];
    }>;
    favoriteCategories: Array<{
      category: BookingProductCategory;
      count: number;
    }>;
    reviewSummary: CustomerDashboardMetricsResponse["metrics"]["reviews"];
    recentActivity: Array<{
      id: string;
      type: "BOOKING" | "FAVORITE" | "REVIEW";
      title: string;
      category: BookingProductCategory;
      createdAt: string;
      status?: BookingStatus;
      amount?: string;
      currency?: CurrencyCode;
      rating?: number;
    }>;
    upcomingBookings: CustomerDashboardBookingSummary[];
  };
};
