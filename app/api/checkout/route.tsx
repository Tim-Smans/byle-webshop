import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/stripe"

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: items.map((item: any) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),

      mode: "payment",

      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
    })

    return NextResponse.json({
      url: session.url,
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}