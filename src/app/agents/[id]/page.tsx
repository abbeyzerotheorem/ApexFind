import AgentProfilePage from '@/components/agent-profile-page';

export default async function Page(props: { params: { id: string } }) {
  return <AgentProfilePage id={props.params.id} />;
}
