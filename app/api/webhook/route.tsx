import { headers } from "next/headers"
import { stripe } from "@/lib/stripe/stripe"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

    const body = await req.text()

    const signature =
        (await headers()).get("stripe-signature")!

    let event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )

    } catch (err) {

        console.error("Webhook error", err)

        return new NextResponse(
            "Webhook Error",
            { status: 400 }
        )
    }

    if (
        event.type ===
        "checkout.session.completed"
    ) {

        const session =
            event.data.object

        console.log(
            "Payment success:",
            session.id
        )

        // hier:

        // save order
        // update database
        // send email
    }

    return NextResponse.json({
        received: true,
    })
}