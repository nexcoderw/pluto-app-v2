import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Pluto Booking",
		short_name: "Pluto",
		description:
			"Book trusted cars, apartments, hotel rooms, and stays with verified Pluto Booking partners.",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#02006c",
		icons: [
			{
				src: "/favicon.png",
				sizes: "259x259",
				type: "image/png",
			},
		],
	};
}
