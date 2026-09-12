import { Link } from "react-router-dom";

export function PageHeader({ eyebrow, title, description, action, actionTo = "/cases" }: { eyebrow: string; title: string; description: string; action?: string; actionTo?: string }) {
  return <section className="page-heading feature-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="subheading">{description}</p></div>{action && <Link className="primary-action" to={actionTo}>{action}</Link>}</section>;
}
