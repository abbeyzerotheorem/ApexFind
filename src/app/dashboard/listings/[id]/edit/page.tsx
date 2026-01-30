import EditListingPage from '@/components/dashboard/edit-listing-page';

export default async function Page(props: Promise<{ params: { id: string } }>) {
    const { params } = await props;
    return <EditListingPage id={params.id} />;
}
