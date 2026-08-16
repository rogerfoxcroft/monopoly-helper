import type { Variant } from '../domain/types'

/** Classic rules — the default. Changes nothing about a board. */
export const STANDARD_VARIANT: Variant = {
  id: 'standard',
  name: 'Standard rules',
  description: 'Classic Monopoly. £200 for passing GO.',
  passGo: 200,
}

/**
 * Well Regulated Monopoly — a house-rule variant that taxes the leader each
 * round to keep the game close. See public/well-regulated-monopoly.pdf.
 */
export const WELL_REGULATED_VARIANT: Variant = {
  id: 'well-regulated',
  name: 'Well Regulated Monopoly',
  description:
    'A wealth tax on the leader each round keeps the game close. £1,000 start, £400 for passing GO.',
  startingCash: 1000,
  passGo: 400,
  wealthTax: {
    bands: [
      { minPlayers: 2, maxPlayers: 4, rate: 0.1 },
      { minPlayers: 5, maxPlayers: 6, rate: 0.15 },
    ],
  },
  rulesPdf: 'well-regulated-monopoly.pdf',
}

/** All selectable variants, in menu order. */
export const variants: Variant[] = [STANDARD_VARIANT, WELL_REGULATED_VARIANT]

export const DEFAULT_VARIANT_ID = STANDARD_VARIANT.id

export function getVariant(id: string): Variant {
  return variants.find((v) => v.id === id) ?? STANDARD_VARIANT
}
