import { getCountryName } from "../shop/countries"

export interface CheckoutInput {
  artPieceIds: string[]
  email: string
  firstName: string
  lastName: string
  phone: string
  isCompany: boolean
  companyName: string
  vatNumber: string
  shippingMethod: "ship" | "pickup"
  countryCode: string
  street: string
  postalCode: string
  city: string
  billingSameAsShipping: boolean
  billingCountryCode: string
  billingStreet: string
  billingPostalCode: string
  billingCity: string
  acceptTerms: boolean
  // Honeypot: real visitors never fill this in
  website: string
}

export type CheckoutErrors = Partial<Record<keyof CheckoutInput, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value: unknown, maxLength = 200): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

// Normalizes untrusted input from the client into a CheckoutInput
export function normalizeCheckoutInput(raw: Record<string, unknown>): CheckoutInput {
  return {
    artPieceIds: Array.isArray(raw.artPieceIds)
      ? raw.artPieceIds.filter((id): id is string => typeof id === "string").slice(0, 50)
      : [],
    email: clean(raw.email).toLowerCase(),
    firstName: clean(raw.firstName, 100),
    lastName: clean(raw.lastName, 100),
    phone: clean(raw.phone, 40),
    isCompany: raw.isCompany === true,
    companyName: clean(raw.companyName),
    vatNumber: clean(raw.vatNumber, 30).toUpperCase().replace(/[\s.]/g, ""),
    shippingMethod: raw.shippingMethod === "pickup" ? "pickup" : "ship",
    countryCode: clean(raw.countryCode, 2).toUpperCase(),
    street: clean(raw.street),
    postalCode: clean(raw.postalCode, 20),
    city: clean(raw.city, 100),
    billingSameAsShipping: raw.billingSameAsShipping !== false,
    billingCountryCode: clean(raw.billingCountryCode, 2).toUpperCase(),
    billingStreet: clean(raw.billingStreet),
    billingPostalCode: clean(raw.billingPostalCode, 20),
    billingCity: clean(raw.billingCity, 100),
    acceptTerms: raw.acceptTerms === true,
    website: clean(raw.website),
  }
}

export function validateCheckoutInput(input: CheckoutInput): CheckoutErrors {
  const errors: CheckoutErrors = {}
  const required = "Dit veld is verplicht"

  if (!input.email) errors.email = required
  else if (!EMAIL_PATTERN.test(input.email)) errors.email = "Vul een geldig e-mailadres in"
  if (!input.firstName) errors.firstName = required
  if (!input.lastName) errors.lastName = required

  if (input.isCompany) {
    if (!input.companyName) errors.companyName = required
    if (!input.vatNumber) errors.vatNumber = required
  }

  if (input.shippingMethod === "ship") {
    if (!getCountryName(input.countryCode)) errors.countryCode = "Kies een land"
    if (!input.street) errors.street = required
    if (!input.postalCode) errors.postalCode = required
    if (!input.city) errors.city = required
  }

  // A separate billing address is only asked when shipping to another address,
  // or always for pickup orders from companies (needed on the invoice)
  const needsBillingAddress =
    (input.shippingMethod === "ship" && !input.billingSameAsShipping) ||
    (input.shippingMethod === "pickup" && input.isCompany)
  if (needsBillingAddress) {
    if (!getCountryName(input.billingCountryCode)) errors.billingCountryCode = "Kies een land"
    if (!input.billingStreet) errors.billingStreet = required
    if (!input.billingPostalCode) errors.billingPostalCode = required
    if (!input.billingCity) errors.billingCity = required
  }

  if (!input.acceptTerms) errors.acceptTerms = "Je moet de algemene voorwaarden aanvaarden om te bestellen"

  return errors
}
