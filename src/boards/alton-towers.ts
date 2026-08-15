import type { Board } from '../domain/types'

/**
 * PLACEHOLDER — Alton Towers Resort edition.
 *
 * The board data (ride names, colour groups, prices, house costs) isn't
 * readily available online, so this stays empty until the real values are
 * supplied. The engine and UI are edition-agnostic, so filling `properties`
 * (and confirming `startingCash`) is all that's needed to make it playable.
 *
 * Not yet exported from `boards/index.ts` while `properties` is empty.
 */
export const altonTowers: Board = {
  id: 'alton-towers',
  name: 'Alton Towers Resort',
  currency: 'GBP',
  locale: 'en-GB',
  startingCash: 1500,
  properties: [],
}
