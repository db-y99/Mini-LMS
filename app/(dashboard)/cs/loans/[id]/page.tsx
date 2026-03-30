import { LoanDetailView } from '@/components/LoanDetailView';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <LoanDetailView />;
}
