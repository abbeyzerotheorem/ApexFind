import { redirect } from 'next/navigation';

export default function RentalsPage() {
  redirect('/search?type=rent');
  // The return value is not used as redirect throws an error, but it's required.
  return null;
}
