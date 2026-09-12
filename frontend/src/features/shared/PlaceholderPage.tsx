import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function PlaceholderPage({ eyebrow, title, description, message }: { eyebrow: string; title: string; description: string; message: string }) {
  return <section className="placeholder-page"><div className="placeholder-icon"><Sparkles size={22} /></div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="subheading">{description}</p><div className="placeholder-card"><strong>{message}</strong><span>This workspace surface is ready for the next Helios FI module.</span></div><Link className="secondary-action" to="/"><ArrowLeft size={14} /> Back to command center</Link></section>;
}
