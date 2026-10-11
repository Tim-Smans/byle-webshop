// The model withdrawal form (modelformulier voor herroeping), as supplied by
// Art by Lé. Single source for the PDF and the printable web page.
export const WITHDRAWAL_FORM = {
  title: "MODELFORMULIER VOOR HERROEPING",
  intro: "Vul dit formulier alleen in en stuur het terug wanneer je een overeenkomst wilt herroepen.",
  recipient: [
    "Art by Lé",
    "Hei-Ende 102",
    "2340 Vlimmeren (Beerse)",
    "België",
    "E-mail: byle.art@outlook.com",
  ],
  statement:
    "Hierbij deel ik / delen wij mee dat ik / wij de overeenkomst betreffende de aankoop van het volgende kunstwerk of de volgende goederen wil / willen herroepen:",
  fields: [
    { label: "Kunstwerk / goederen:", lines: 2 },
    { label: "Besteld op:", lines: 1 },
    { label: "Ontvangen op:", lines: 1 },
    { label: "Naam van de consument(en):", lines: 1 },
    { label: "Adres van de consument(en):", lines: 2 },
    {
      label: "Handtekening van de consument(en):",
      note: "(alleen nodig wanneer dit formulier op papier wordt ingediend)",
      lines: 1,
    },
    { label: "Datum:", lines: 1 },
  ] as { label: string; note?: string; lines: number }[],
  footnote: "Doorhalen wat niet van toepassing is.",
}
