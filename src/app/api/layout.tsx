// Forcer TOUTES les routes API à être dynamiques
// Empêche Next.js de les évaluer au build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function ApiLayout({ children }: { children: React.ReactNode }) {
  return children;
}

