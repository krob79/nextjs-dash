import NewCustomerForm from '@/app/ui/customers/new-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomerById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { console } from 'inspector';


export const metadata: Metadata = {
    title: 'Create New Customer',
}; 
 
export default async function Page() {

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Customers', href: '/dashboard/customers' },
                    {
                        label: 'Create New Customer',
                        href: `/dashboard/customers/create`,
                        active: true,
                    },
                ]}
            />
            <NewCustomerForm />
        </main>
    );
}