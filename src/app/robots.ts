import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: [
				"/account/",
				"/partner/",
				"/partner-onboarding",
				"/auth/",
				"/complete-phone",
				"/forgot-password",
				"/login",
				"/register",
				"/reset-password",
				"/verify-email",
				"/payment/",
			],
		},
		sitemap: new URL("/sitemap.xml", siteUrl).toString(),
	};
}
