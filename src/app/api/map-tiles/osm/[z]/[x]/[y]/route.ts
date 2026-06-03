const tileCacheSeconds = 60 * 60 * 24 * 14;
const fallbackCacheSeconds = 60 * 10;

type TileParams = {
	z: string;
	x: string;
	y: string;
};

export async function GET(
	_request: Request,
	context: { params: Promise<TileParams> },
) {
	const params = await context.params;
	const tile = parseTileParams(params);

	if (!tile) {
		return fallbackTileResponse("Invalid map tile", 200);
	}

	try {
		const upstream = await fetch(
			`https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`,
			{
				headers: {
					"User-Agent": "PlutoBooking/1.0 (local development map proxy)",
				},
				next: { revalidate: tileCacheSeconds },
			},
		);

		if (!upstream.ok) {
			return fallbackTileResponse("Street tile unavailable", 200);
		}

		return new Response(await upstream.arrayBuffer(), {
			headers: {
				"Cache-Control": `public, max-age=${tileCacheSeconds}, stale-while-revalidate=${tileCacheSeconds}`,
				"Content-Type": upstream.headers.get("Content-Type") ?? "image/png",
			},
		});
	} catch {
		return fallbackTileResponse("Street tile offline", 200);
	}
}

function parseTileParams(params: TileParams) {
	const z = Number(params.z);
	const x = Number(params.x);
	const y = Number(params.y);

	if (
		!Number.isInteger(z) ||
		!Number.isInteger(x) ||
		!Number.isInteger(y) ||
		z < 0 ||
		z > 19
	) {
		return null;
	}

	const maxTile = 2 ** z;

	if (x < 0 || y < 0 || x >= maxTile || y >= maxTile) {
		return null;
	}

	return { z, x, y };
}

function fallbackTileResponse(label: string, status: number) {
	return new Response(createFallbackTile(label), {
		status,
		headers: {
			"Cache-Control": `public, max-age=${fallbackCacheSeconds}`,
			"Content-Type": "image/svg+xml; charset=utf-8",
		},
	});
}

function createFallbackTile(label: string) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-label="${escapeSvg(label)}">
		<rect width="256" height="256" fill="#eef0f6"/>
		<path d="M-30 48 C34 34 60 62 112 48 C158 36 196 26 286 42" fill="none" stroke="#d3d9e6" stroke-width="8" stroke-linecap="round"/>
		<path d="M-20 152 C38 132 76 146 116 126 C166 102 204 112 286 92" fill="none" stroke="#d3d9e6" stroke-width="7" stroke-linecap="round"/>
		<path d="M34 -24 C52 36 54 86 84 136 C112 184 120 220 104 286" fill="none" stroke="#cbd3e2" stroke-width="6" stroke-linecap="round"/>
		<path d="M176 -28 C150 38 152 82 184 130 C214 176 226 212 218 286" fill="none" stroke="#cbd3e2" stroke-width="6" stroke-linecap="round"/>
		<path d="M-18 210 L72 178 L128 196 L274 158" fill="none" stroke="#dce2ec" stroke-width="4" stroke-linecap="round"/>
		<path d="M-18 78 L58 102 L116 86 L274 118" fill="none" stroke="#dce2ec" stroke-width="3" stroke-linecap="round"/>
		<path d="M0 0H256V256H0z" fill="none" stroke="#e1e6ef" stroke-width="1"/>
	</svg>`;
}

function escapeSvg(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}
