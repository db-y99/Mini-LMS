import { redirect } from 'next/navigation';

export default function AccIndex() {
  redirect('/acc/disbursements-pending');
}
