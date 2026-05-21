import Stripe from 'stripe';

import Medicine from '@/models/medicinesModel';
import PurchasedMedicine from '@/models/purchasedMedicineModel';
import { dbConnect } from "@/lib/mongodb";
import generateInvoice from '@/lib/generateInvoice';
import sendEmail from '@/lib/sendEmailInvoice';
import path from 'path';
import fs from 'fs';

export const runtime = "nodejs";

export async function POST(req) {
  console.log("📥 RECEIVED WEBHOOK REQUEST");
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ STRIPE_SECRET_KEY is missing from environment variables");
    return new Response('Stripe key missing', { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    let event;
    if (!signature && process.env.NODE_ENV === 'development') {
      console.warn("⚠️ No stripe-signature found. Bypassing signature verification in development mode.");
      try {
        event = JSON.parse(body);
      } catch (parseErr) {
        return new Response(`Failed to parse body: ${parseErr.message}`, { status: 400 });
      }
    } else if (!signature) {
      console.error("❌ No stripe-signature found in headers");
      return new Response('No signature', { status: 400 });
    } else {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error(`⚠️ Webhook signature verification failed:`, err.message);
        if (process.env.NODE_ENV === 'development') {
          console.warn("⚠️ Bypassing signature verification failure in development mode.");
          try {
            event = JSON.parse(body);
          } catch (parseErr) {
            return new Response(`Failed to parse body: ${parseErr.message}`, { status: 400 });
          }
        } else {
          return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }
      }
    }

    console.log(`🔔 Received event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // 1. Extract metadata from Stripe Session
      const medicineId = session.metadata?.medicineId;
      const quantityStr = session.metadata?.quantity;
      const email = session.metadata?.email || session.customer_email || session.customer_details?.email;
      const quantity = parseInt(quantityStr || '0');

      console.log('✅ Payment confirmed for session:', session.id);
      console.log('📦 Metadata:', { medicineId, quantity, email });

      if (medicineId && quantity > 0) {
        try {
          // 2. Connect to DB 
          await dbConnect();

          // 3. Update Medicine Stock
          const updatedMedicine = await Medicine.findByIdAndUpdate(
            medicineId,
            { $inc: { quantity: -quantity } },
            { new: true }
          );

          if (!updatedMedicine) {
            console.error(`❌ Medicine not found with ID: ${medicineId}`);
            return new Response('Medicine not found', { status: 404 });
          }

          // 4. Create Purchased Medicine Record
          const purchasedMedicine = new PurchasedMedicine({
            recordID: medicineId,
            quantity: quantity,
            medicineName: updatedMedicine.name,
            price: updatedMedicine.price || 0,
            totalPrice: (updatedMedicine.price || 0) * quantity,
            image: updatedMedicine.image,
            purchasedAt: Date.now()
          });

          await purchasedMedicine.save();

          // 5. Generate and Send Invoice
          const filePath = path.join(process.cwd(), `invoice-${session.id}.pdf`);
          
          try {
            await generateInvoice({
              name: updatedMedicine.name,
              quantity: quantity,
              price: updatedMedicine.price,
              total: (updatedMedicine.price || 0) * quantity
            }, filePath);

            if (email) {
              await sendEmail(email, filePath);
              console.log(`📧 Invoice sent to ${email}`);
            } else {
              console.warn("⚠️ No email found to send invoice");
            }

            // Cleanup
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`🧹 Deleted temp file: ${filePath}`);
            }
          } catch (invoiceErr) {
            console.error("❌ Invoice/Email step failed:", invoiceErr.message);
            // Don't fail the whole webhook if email fails, but log it.
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }

          console.log(`🚀 Fulfillment complete for ${updatedMedicine.name}.`);
        } catch (dbError) {
          console.error("❌ fulfillment processing failed:", dbError.message);
          // Return 500 to Stripe so it retries
          return new Response('Internal Server Error during fulfillment', { status: 500 });
        }
      } else {
        console.warn("⚠️ Missing medicineId or quantity in session metadata");
      }
    }

    return new Response('Event received', { status: 200 });

  } catch (globalError) {
    console.error("💥 GLOBAL WEBHOOK ERROR:", globalError.message);
    return new Response(`Internal Server Error: ${globalError.message}`, { status: 500 });
  }
}
