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
  rulesSummary: [
    {
      heading: 'The idea',
      body: 'A wealth tax on whoever is in the lead keeps the game a genuine contest to the final round. Everything not listed here plays as normal Monopoly.',
    },
    {
      heading: 'Starting cash',
      body: 'Each player starts with £1,000 — a standard opening deal, but with one £500 note instead of two.',
    },
    {
      heading: 'Passing GO',
      body: 'Collect £400 each time you pass GO.',
    },
    {
      heading: 'The wealth tax',
      body: 'At the end of every round (once all players have had a turn), the player with the highest net worth who owns at least one property pays a wealth tax, split equally among the other players and rounded down to the nearest £1. The money stays in the game — it is never paid to the bank.\n\n• 2–4 players: 10% of the leader’s net worth\n• 5–6 players: 15% of the leader’s net worth\n\nNet worth = cash + printed price of property + cost of houses and hotels.',
    },
    {
      heading: 'Winning',
      body: 'Play until 2 hours have passed or 30 rounds are complete, whichever comes first. The highest net worth then wins. A player who goes bankrupt is out; if only one player is left, they win at once.',
    },
    {
      heading: 'How to win',
      body: 'Because the leader is taxed every round, you can’t coast on an early lead. Keep buying, building and — above all — trading. A property you can’t complete into a set is still worth cash to a rival who can, so make the deal.',
    },
  ],
  rulesPdf: 'well-regulated-monopoly.pdf',
}

/** All selectable variants, in menu order. */
export const variants: Variant[] = [STANDARD_VARIANT, WELL_REGULATED_VARIANT]

export const DEFAULT_VARIANT_ID = STANDARD_VARIANT.id

export function getVariant(id: string): Variant {
  return variants.find((v) => v.id === id) ?? STANDARD_VARIANT
}
