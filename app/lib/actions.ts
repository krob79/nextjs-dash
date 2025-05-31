'use server';

import { z } from 'zod';
import { revalidatePath} from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { uploadToS3 } from './s3-utils'; // assume you build this
// import { error } from 'console';

const sql = postgres(process.env.POSTGRES_URL!, {ssl: 'require'});

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer',
    }),
    amount: z.coerce
        .number()
        .gt(0, {message: 'Please enter an amount greater than $0.'}),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CustomerSchema = z.object({
    id: z.string(),
    name: z.string({
        invalid_type_error: 'Please enter a customer name.',
    }),
    email: z.string({
        invalid_type_error: 'Please enter a customer email.',
    }).email('Please enter a valid email address.'),
    //we have to figure out how to upload images
    image_url: z.string().url('Please enter a valid URL.'),
});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export type CustomerState = {
    id: string;
    name: string;
    email: string;
    errors?: {
        id?: string[];
        name?: string[];
        email?: string[];
    };
    message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });


export async function createInvoice(prevState: State, formData: FormData){
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if(!validatedFields.success){
        console.log('------Validation failed', validatedFields);
        return{
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    
    try{
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch(error){
        console.error(error);
        return {
            message: 'Database Error: Failed to Create Invoice.',
        }
    }
    // Revalidate the invoices page to reflect the new invoice - fresh data will be pulled from the server
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

}

const UpdateInvoice = FormSchema.omit({id: true, date: true});

export async function updateInvoice(
    id: string, 
    prevState: State,
    formData: FormData
){
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if(!validatedFields.success){
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try{
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
    }catch(error){
        console.error(error);
        return {message: 'Database Error: Failed to Update Invoice.'}
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

const CreateCustomer = CustomerSchema.omit({ id: true });

export async function createCustomer(prevState: any, formData: any){

    console.log("-----CREATE CUSTOMER - formData is: ", formData);

    let newFormData = {
        id: formData.get('id'),
        name: formData.get('name'),
        email: formData.get('email'),
        image_url: formData.get('image_url').name
    }

    console.log("-----CREATE CUSTOMER - newformData is: ", newFormData);

    // const validatedFields = CustomerSchema.safeParse(newFormData);

    // const validatedFields = CustomerSchema.safeParse({
    //     id: randomUUID().toString() ?? '',
    //     name: formData.get('name') ?? '',
    //     email: formData.get('email') ?? '',
    //     image_url: formData.get('image_url') ?? ''
    // });

    // if(!validatedFields.success){
    //     console.log('------Validation failed', validatedFields);
    //     return{
    //         errors: validatedFields.error.flatten().fieldErrors,
    //         message: 'Missing Fields. Failed to Create Invoice.',
    //     };
    // }
    // const { name, email, image_url } = validatedFields.data;


    const { id, name, email, image_url } = newFormData;
    
    try{
        await sql`
            INSERT INTO customers (id, name, email, image_url)
            VALUES (${id}, ${name}, ${email}, ${image_url})
        `;
    } catch(error){
        console.error(error);
        return {
            message: 'Database Error: Failed to Create Customer.',
        }
    }
    // Revalidate the invoices page to reflect the new invoice - fresh data will be pulled from the server
    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');

}

// const UpdateCustomer = CustomerSchema.omit({id: true});

export async function updateCustomer(
    prevState:any,
    formData:any
){
    console.log('---UPDATE CUSTOMER - formData is: ', formData);
    // const validatedCustomerFields = CustomerSchema.safeParse({
    //     id: formData.get('id') ?? '',
    //     name: formData.get('name') ?? '',
    //     email: formData.get('email') ?? '',
    //     image_url: formData.get('image_url') ?? ''
    // });
    let newFormData = {
        id: formData.get('id'),
        name: formData.get('name'),
        email: formData.get('email'),
        image_url: (formData.get('image_url') instanceof File) ? formData.get('image_url').name : formData.get('image_url')
    }

    console.log('---UPDATE CUSTOMER - newFormData is: ', newFormData);

    // if(!validatedCustomerFields.success){
    //     return {
    //         errors: validatedCustomerFields.error.flatten().fieldErrors,
    //         message: 'Missing Fields. Failed to Update Customer.',
    //     };
    // }

    // const { id, name, email } = validatedCustomerFields.data;
    const { id, name, email, image_url } = newFormData;
    try{
        await sql`
            UPDATE customers
            SET name = ${name}, email = ${email}, image_url = ${image_url}
            WHERE id = ${id}
        `;
    }catch(error){
        console.error(error);
        return {message: 'Database Error: Failed to Update Customer.'}
    }

    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}

export async function deleteInvoice(id: string){
    // throw new Error('FAILED TO DELETE INVOICE!!!');
    await sql`
        DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
}

export async function deleteCustomer(id: string){
    // throw new Error('FAILED TO DELETE INVOICE!!!');
    await sql`
        DELETE FROM customers WHERE id = ${id}`;
    revalidatePath('/dashboard/customers');
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
){
    try{
        await signIn('credentials', formData);
    }catch(error){
        if(error instanceof AuthError){
            switch(error.type){
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong - an unknown error occurred.';
            }
        }
        throw error;
    }

}