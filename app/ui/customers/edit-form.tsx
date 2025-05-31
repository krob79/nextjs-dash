'use client';
import { CustomersTableType } from '@/app/lib/definitions';
import {
  UserIcon,
  AtSymbolIcon,
  PhotoIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateCustomer, CustomerState } from '@/app/lib/actions';
import { useActionState } from 'react';
import { onImageUpdate } from '@/app/lib/utils';
import { prepareActionData } from '@/app/lib/prepareActionData';



export default function EditCustomerForm({
  customer,
}: {
  customer: CustomersTableType[];
}) {

  const handleSubmit = async (e:any) => {
    console.log("----handle submit ", e.target);
    e.preventDefault();
    const actionData = await prepareActionData(e.target);
    await updateCustomer({}, actionData);
  };
  
  
  const customerToEdit = customer[0];
 //const initialState: CustomerState = { id: customer[0].id, name: '', email: '', image_url: '', errors: {}, message: '' };
//const updateCustomerWithId = updateCustomer.bind(null, customerToEdit.id);
// const [state, formAction] = useActionState(updateCustomer, initialState);
  
  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Customer Name
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input type='hidden' name='id' value={customerToEdit.id} />
              <input
                id="name"
                name="name"
                type="string"
                step="0.01"
                defaultValue={customerToEdit.name}
                placeholder="Enter Customer Name"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        {/* Customer Email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Customer Email
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="string"
                step="0.01"
                defaultValue={customerToEdit.email}
                placeholder="Enter Customer Email"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        {/* Customer Image */}
          <div className="mb-4">
            <label htmlFor="image_url" className="mb-2 block text-sm font-medium">
              Customer Image
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="image_url"
                  name="image_url"
                  type="file"
                  step="0.01"
                  // value={customerToEdit.image_url}
                  onChange={onImageUpdate}
                />
                <input type="hidden" name="prev_image_url" value={customerToEdit.image_url} />
                <img id="avatar" className="w-full max-w-40" src={`${process.env.NEXT_PUBLIC_AWS_IMG_CDN}${customerToEdit.image_url}`} alt="Image preview" />
              </div>
            </div>
          </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Update Customer</Button>
      </div>
    </form>
  );
}
