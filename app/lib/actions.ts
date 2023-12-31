'use server'

import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
})

const CreateInvoice = FormSchema.omit({ date: true })
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
export type State = {
    errors?: {
        customerId?: string[],
        amount?: string[],
        status?: string[]
    },
    message?: string | null
  }

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    id: formData.get('id'),
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  if (!validatedFields.success) {
    return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Misssing Fields. Failed to Create Invoice',
    }
  }
  const { id, customerId, amount, status } = validatedFields.data
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]
  
  try {

      await sql`
      INSERT INTO invoices (id, customer_id, amount, status, date)
      VALUES(${id}, ${customerId}, ${amountInCents}, ${status}, ${date})
      `
    } catch (err) {
        return { message: (err as Error).message }
    }

  revalidatePath('/dashboards/invoices')
  redirect('/dashboard/invoices')
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
       const amountInCents = amount * 100;
   
    try {
        await sql`
          UPDATE invoices
          SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
          WHERE id = ${id}
        `;
    } catch (err) {
        return { message: 'Database Error: Failed to Update Invoice' }
    }
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  export async function deleteInvoice(id: string) {
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`
        revalidatePath('/dashboards/invoices')
        return { message: 'Deleted Invoice' }
    } catch (err) {
        return { message: 'Database Error: Failed to Delete Invoice' }
    }
  }

  export async function authenticate(
    prevState: string | undefined, 
    formData: FormData,
  ) {
    try {
        await signIn('credentials', Object.fromEntries(formData))
    } catch (error) {
        if ((error as Error).message.includes('CredentialSignin')) {
            return 'CredentialSignin'
        }
        throw error
    }
  }