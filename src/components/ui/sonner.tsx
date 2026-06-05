"use client";

import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";

const iconClassName = "size-4 shrink-0";

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="light"
			className="toaster group"
			closeButton
			duration={4500}
			gap={12}
			offset={18}
			position="top-right"
			icons={{
				success: <CircleCheckIcon className={iconClassName} />,
				info: <InfoIcon className={iconClassName} />,
				warning: <TriangleAlertIcon className={iconClassName} />,
				error: <OctagonXIcon className={iconClassName} />,
				loading: <Loader2Icon className={`${iconClassName} animate-spin`} />,
			}}
			style={
				{
					"--normal-bg": "#ffffff",
					"--normal-text": "#171720",
					"--normal-border": "rgba(2, 0, 108, 0.14)",
					"--success-bg": "#f5fff8",
					"--success-border": "rgba(22, 163, 74, 0.22)",
					"--success-text": "#102317",
					"--info-bg": "#f6f7ff",
					"--info-border": "rgba(2, 0, 108, 0.18)",
					"--info-text": "#171720",
					"--warning-bg": "#fffaf0",
					"--warning-border": "rgba(217, 119, 6, 0.24)",
					"--warning-text": "#251a07",
					"--error-bg": "#fff5f5",
					"--error-border": "rgba(220, 38, 38, 0.22)",
					"--error-text": "#241111",
					"--border-radius": "22px",
				} as CSSProperties
			}
			toastOptions={{
				classNames: {
					toast:
						"group/toast group-[.toaster]:min-h-[76px] group-[.toaster]:items-start group-[.toaster]:gap-3 group-[.toaster]:rounded-[22px] group-[.toaster]:border group-[.toaster]:bg-white/95 group-[.toaster]:px-4 group-[.toaster]:py-4 group-[.toaster]:shadow-[0_22px_60px_rgba(15,23,42,0.16)] group-[.toaster]:backdrop-blur-xl",
					content: "group-[.toaster]:gap-1.5",
					icon: "group-[.toaster]:mt-0.5 group-[.toaster]:flex group-[.toaster]:size-9 group-[.toaster]:items-center group-[.toaster]:justify-center group-[.toaster]:rounded-full group-[.toaster]:border group-[.toaster]:border-[rgba(2,0,108,0.12)] group-[.toaster]:bg-[#f7f7ff] group-[.toaster]:text-[#02006c]",
					title:
						"group-[.toaster]:text-[0.92rem] group-[.toaster]:font-[850] group-[.toaster]:leading-5 group-[.toaster]:tracking-normal group-[.toaster]:text-[#171720]",
					description:
						"group-[.toaster]:max-w-[28rem] group-[.toaster]:text-[0.78rem] group-[.toaster]:font-medium group-[.toaster]:leading-5 group-[.toaster]:text-[rgba(23,23,32,0.66)]",
					actionButton:
						"group-[.toaster]:h-10 group-[.toaster]:rounded-full group-[.toaster]:bg-[#02006c] group-[.toaster]:px-4 group-[.toaster]:text-[0.75rem] group-[.toaster]:font-[850] group-[.toaster]:text-white group-[.toaster]:shadow-[0_14px_32px_rgba(2,0,108,0.24)]",
					cancelButton:
						"group-[.toaster]:h-10 group-[.toaster]:rounded-full group-[.toaster]:border group-[.toaster]:border-[rgba(2,0,108,0.12)] group-[.toaster]:bg-white group-[.toaster]:px-4 group-[.toaster]:text-[0.75rem] group-[.toaster]:font-[850] group-[.toaster]:text-[#02006c]",
					closeButton:
						"group-[.toaster]:left-auto group-[.toaster]:right-3 group-[.toaster]:top-3 group-[.toaster]:size-7 group-[.toaster]:rounded-full group-[.toaster]:border group-[.toaster]:border-[rgba(2,0,108,0.12)] group-[.toaster]:bg-white group-[.toaster]:text-[#02006c] group-[.toaster]:shadow-sm",
					success:
						"group-[.toaster]:border-[rgba(22,163,74,0.22)] group-[.toaster]:bg-[#f7fff9]",
					error:
						"group-[.toaster]:border-[rgba(220,38,38,0.22)] group-[.toaster]:bg-[#fff7f7]",
					warning:
						"group-[.toaster]:border-[rgba(217,119,6,0.24)] group-[.toaster]:bg-[#fffaf0]",
					info: "group-[.toaster]:border-[rgba(2,0,108,0.18)] group-[.toaster]:bg-[#f7f7ff]",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
