// Countries the admin can enable for shipping (EU, EEA, UK and Switzerland).
// Anything else goes through the contact form.
export const SHIPPING_COUNTRIES: { code: string; name: string }[] = [
  { code: "BE", name: "België" },
  { code: "NL", name: "Nederland" },
  { code: "LU", name: "Luxemburg" },
  { code: "FR", name: "Frankrijk" },
  { code: "DE", name: "Duitsland" },
  { code: "AT", name: "Oostenrijk" },
  { code: "BG", name: "Bulgarije" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Tsjechië" },
  { code: "DK", name: "Denemarken" },
  { code: "EE", name: "Estland" },
  { code: "ES", name: "Spanje" },
  { code: "FI", name: "Finland" },
  { code: "GR", name: "Griekenland" },
  { code: "HR", name: "Kroatië" },
  { code: "HU", name: "Hongarije" },
  { code: "IE", name: "Ierland" },
  { code: "IT", name: "Italië" },
  { code: "LT", name: "Litouwen" },
  { code: "LV", name: "Letland" },
  { code: "MT", name: "Malta" },
  { code: "PL", name: "Polen" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Roemenië" },
  { code: "SE", name: "Zweden" },
  { code: "SI", name: "Slovenië" },
  { code: "SK", name: "Slowakije" },
  { code: "NO", name: "Noorwegen" },
  { code: "IS", name: "IJsland" },
  { code: "LI", name: "Liechtenstein" },
  { code: "CH", name: "Zwitserland" },
  { code: "GB", name: "Verenigd Koninkrijk" },
]

export function getCountryName(code: string): string | undefined {
  return SHIPPING_COUNTRIES.find((country) => country.code === code)?.name
}
