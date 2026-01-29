import EditListingPage from '@/components/dashboard/edit-listing-page';

export default async function Page(props: { params: { id: string } }) {
    return <EditListingPage id={props.params.id} />;
}
