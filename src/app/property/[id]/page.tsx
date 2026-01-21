import PropertyDetailsPage from '@/components/property-details-page';

export default function Page({ params }: { params: { id: string } }) {
  return <PropertyDetailsPage id={params.id} />;
}
