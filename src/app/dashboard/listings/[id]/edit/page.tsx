import EditListingPage from '@/components/dashboard/edit-listing-page';

export default async function Page({ params }: { params: { id: string } }) {
    return <EditListingPage id={params.id} />;
}
