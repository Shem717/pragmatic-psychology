import { EvidenceNav } from "@/components/evidence/EvidenceNav";
import "./evidence.css";
export default function EvidenceLayout({ children }: { children: React.ReactNode }) {
  return <div className="evidence-workspace"><EvidenceNav />{children}</div>;
}
