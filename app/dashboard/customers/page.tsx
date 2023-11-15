import Pagination from '@/app/ui/invoices/pagination';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { ActionButtonSkeleton, InvoicesTableSkeleton, SearchBarSkeleton } from '@/app/ui/skeletons';

 
export default async function Page() {
  const totalPages = 3
  
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <SearchBarSkeleton />
        <ActionButtonSkeleton />
      </div>
       <InvoicesTableSkeleton />
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}