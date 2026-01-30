import AgentProfilePage from '@/components/agent-profile-page';

export default async function Page(props: Promise<{ params: { id: string } }>) {
  const { params } = await props;
  return <AgentProfilePage id={params.id} />;
}
