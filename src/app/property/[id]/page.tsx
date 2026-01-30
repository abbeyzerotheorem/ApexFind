import PropertyDetailsPage from '@/components/property-details-page';

export default async function Page(props: Promise<{ params: { id: string } }>) {
  const { params } = await props;
  return <PropertyDetailsPage id={params.id} />;
}
