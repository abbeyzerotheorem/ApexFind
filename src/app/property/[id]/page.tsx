import PropertyDetailsPage from '@/components/property-details-page';

export default async function Page(props: { params: { id: string } }) {
  return <PropertyDetailsPage id={props.params.id} />;
}
