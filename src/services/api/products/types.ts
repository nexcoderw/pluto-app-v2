export type ProductCategory =
  | "CAR"
  | "APARTMENT"
  | "HOTEL_ROOM"
  | "AIRBNB_HOUSE";
export type ProductStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED"
  | "ARCHIVED";
export type ProductVisibility = "PUBLIC" | "PRIVATE";
export type PricingUnit = "HOUR" | "DAY" | "NIGHT" | "WEEK" | "MONTH";

export type ProductImage = {
  id: string;
  altText: string | null;
  sortOrder: number;
  isCover: boolean;
  file: {
    id: string;
    originalName: string;
    publicUrl: string | null;
    key: string;
    storageProvider: "CLOUDINARY" | "LOCAL";
    syncStatus: "SYNCED" | "PENDING" | "FAILED";
  };
};

export type CarDetails = {
  id: string;
  productId: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string | null;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  luggageCapacity: number | null;
  airConditioning: boolean;
  driverIncluded: boolean;
  insuranceIncluded: boolean;
  mileageLimitPerDay: number | null;
  minimumDriverAge: number | null;
  requiresDeposit: boolean;
  depositAmount: string | null;
};

export type Product = {
  id: string;
  productNo: string;
  ownerId?: string;
  category: ProductCategory;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  title: string;
  slug: string;
  description?: string;
  shortDescription: string | null;
  city: string;
  country: string;
  basePrice: string;
  currency: string;
  pricingUnit: PricingUnit;
  isAvailable?: boolean;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  publishedAt: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  images: ProductImage[];
  owner: {
    id: string;
    fullName: string;
    imageKey: string | null;
    email?: string;
  };
  carDetails?: CarDetails | null;
};

export type ProductListRequest = {
  page?: number;
  category?: ProductCategory;
  city?: string;
  country?: string;
  search?: string;
  orderBy?: "createdAt" | "basePrice" | "title";
  order?: "asc" | "desc";
};

export type ProductListResponse = {
  items: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    orderBy: string;
    order: "asc" | "desc";
  };
};

export type ProductDetailResponse = {
  product: Product;
};
