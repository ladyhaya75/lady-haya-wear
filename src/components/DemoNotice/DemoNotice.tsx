import { Info } from "lucide-react";

// Bandeau d'information : site mis en pause par la cliente, utilisé comme démo portfolio
export default function DemoNotice() {
	return (
		<div className="bg-amber-50 border-y border-amber-200 px-3 sm:px-6 py-3">
			<div className="max-w-4xl mx-auto flex items-start gap-2 text-amber-800">
				<Info className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
				<p className="text-base sm:text-lg leading-relaxed">
					Ce site est actuellement mis en pause par la cliente et n&apos;est
					pas en production : il est présenté ici à titre de démonstration
					pour mon portfolio, les images affichées sont uniquement
					illustratives et ne représentent pas les vrais produits de la
					marque.
				</p>
			</div>
		</div>
	);
}
