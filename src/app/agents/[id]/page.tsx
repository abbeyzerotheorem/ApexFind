import AgentProfilePage from '@/components/agent-profile-page';

export default async function Page({ params }: { params: { id: string } }) {
  return <AgentProfilePage id={params.id} />;
}
