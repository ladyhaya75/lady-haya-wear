import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
	title: "Bientôt disponible | Lady Haya Wear",
	description:
		"Lady Haya Wear — notre site sera bientôt opérationnel. Merci de votre patience.",
	robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
	return (
		<main className="relative min-h-[100dvh] overflow-hidden flex flex-col items-center justify-center px-6 py-16">
			{/* Fond dégradé + halos doux (couleurs du site) */}
			<div
				className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-nude-light)] via-[var(--color-rose-light-2)] to-[var(--color-beige-light)]"
				aria-hidden
			/>
			<div
				className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[min(90vw,42rem)] h-[min(90vw,42rem)] rounded-full bg-[var(--color-rose-medium)]/35 blur-3xl -z-10"
				aria-hidden
			/>
			<div
				className="absolute bottom-0 right-0 w-[min(70vw,28rem)] h-[min(70vw,28rem)] rounded-full bg-[var(--color-nude-medium)]/25 blur-3xl -z-10"
				aria-hidden
			/>

			<div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto animate-fade-in-up">
				<div className="mb-8 drop-shadow-sm">
					<Image
						src="/assets/logo-haya.png"
						alt="Lady Haya Wear"
						width={220}
						height={220}
						className="w-40 h-40 sm:w-48 sm:h-48 object-contain mx-auto"
						priority
					/>
				</div>

				<h1 className="font-alex-brush text-5xl sm:text-6xl md:text-7xl text-logo mb-4 tracking-wide">
					Lady Haya Wear
				</h1>

				<p className="font-geist-sans text-4xl sm:text-5xl md:text-6xl font-bold   tracking-[0.12em] text-[var(--color-logo)] mb-6">
					Coming soon
				</p>

				<p className="font-poppins text-lg sm:text-xl text-[var(--color-nude-dark-2)] font-medium leading-relaxed mb-2">
					Notre site sera bientôt opérationnel.
				</p>
				<p className="text-sm sm:text-base text-[var(--color-beige-dark)]/90 max-w-md">
					Nous préparons votre expérience shopping — merci de votre patience.
				</p>

				<div
					className="mt-10 h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-[var(--color-rose-dark-2)] to-transparent opacity-80"
					aria-hidden
				/>
			</div>
		</main>
	);
}
