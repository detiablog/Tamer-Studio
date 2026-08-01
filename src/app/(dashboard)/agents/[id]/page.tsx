import { AgentDetailPageClient } from "./pageClient";

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <AgentDetailPageClient params={params} />;
}
