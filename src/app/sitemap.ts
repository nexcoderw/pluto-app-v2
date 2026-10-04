import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const publicRoutes = [
	"/",
	"/listings",
	"/listings/cars",
	"/listings/apartments",
	"/listings/hotel-rooms",
	"/listings/airbnb",
	"/flights",
	"/contact",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
	return publicRoutes.map((path) => ({
		url: new URL(path, siteUrl).toString(),
		changeFrequency: path === "/" ? "daily" : "weekly",
		priority: path === "/" ? 1 : path === "/listings" ? 0.9 : 0.8,
	}));
}
