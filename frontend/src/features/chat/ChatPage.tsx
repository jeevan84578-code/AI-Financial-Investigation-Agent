import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { PageHeader } from "../shared/PageHeader";

export function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [sentPrompt, setSentPrompt] = useState("");
  const ask = (question: string) => setPrompt(question);
  const submit = () => { if (prompt.trim()) { setSentPrompt(prompt.trim()); setPrompt(""); } };
  return <><PageHeader eyebrow="Evidence-grounded intelligence" title="AI investigator" description="Ask questions about your cases, vendors, and financial evidence." /><section className="chat-panel"><div className="chat-header"><div className="brand-mark"><Sparkles size={16} /></div><div><strong>Helios Investigator</strong><span>Ready to investigate · Case context enabled</span></div></div><div className="chat-messages"><div className="chat-message assistant"><span className="chat-avatar"><Sparkles size={14} /></span><div><p>Good morning, Jeevan. I can help investigate anomalies, explain risk scores, and find supporting evidence.</p><div className="suggestion-row"><button onClick={() => ask("Why is Apex Logistics high risk?")}>Why is Apex Logistics high risk?</button><button onClick={() => ask("Summarize open cases")}>Summarize open cases</button></div></div></div>{sentPrompt && <div className="chat-message user"><p>{sentPrompt}</p></div>}<div className="chat-message assistant"><span className="chat-avatar"><Sparkles size={14} /></span><div><p>Two investigations need review before the next payment run: duplicate invoices connected to Apex Logistics and unusual payment velocity from Cobalt Systems.</p><small>Sources: INV-2048, INV-2045 · Confidence 94%</small></div></div></div><div className="chat-composer"><input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="Ask about a case, vendor, or transaction…" /><button onClick={submit} aria-label="Send message"><Send size={16} /></button></div></section></>;
}
