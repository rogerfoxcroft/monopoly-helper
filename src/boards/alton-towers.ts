import type { Board, Group, PropertyDef } from '../domain/types'

/**
 * Alton Towers Resort edition — "Wicker Man" (2018) printing.
 *
 * Structurally identical to the standard UK board (same price tiers, house
 * costs and half-price mortgages); only the names change. Streets, destinations
 * (stations) and utilities are interleaved into the standard board positions.
 *
 * Note: the source data gave no purchase cost for utilities, so the standard
 * £150 is assumed (consistent with the rest of the board).
 */

const HOUSE_COST: Partial<Record<Group, number>> = {
  brown: 50,
  lightblue: 50,
  pink: 100,
  orange: 100,
  red: 150,
  yellow: 150,
  green: 200,
  darkblue: 200,
}

function prop(id: string, name: string, group: Group, price: number): PropertyDef {
  return { id, name, group, price, houseCost: HOUSE_COST[group] ?? 0 }
}

// Board order (GO → clockwise), destinations & utilities in standard positions.
const properties: PropertyDef[] = [
  prop('runaway-mine-train', 'Runaway Mine Train', 'brown', 60),
  prop('congo-river-rapids', 'Congo River Rapids', 'brown', 60),

  prop('alton-towers-hotels', 'Alton Towers Hotels', 'station', 200),

  prop('battle-galleons', 'Battle Galleons', 'lightblue', 100),
  prop('heave-ho', 'Heave Ho', 'lightblue', 100),
  prop('sharkbait-reef', 'Sharkbait Reef', 'lightblue', 120),

  prop('skyride', 'Skyride', 'pink', 140),
  prop('towers-trading-company', 'Towers Trading Company', 'utility', 150),
  prop('the-gardens', 'The Gardens', 'pink', 140),
  prop('the-towers', 'The Towers', 'pink', 160),

  prop('alton-towers-waterpark', 'Alton Towers Waterpark', 'station', 200),

  prop('woodcutters-bar-and-grill', "Woodcutter's Bar & Grill", 'orange', 180),
  prop('spinball-wirer', 'Spinball Wirer', 'orange', 180),
  prop('hex', 'Hex', 'orange', 200),

  prop('nemesis', 'Nemesis', 'red', 220),
  prop('galactica', 'Galactica', 'red', 220),
  prop('rollercoaster-restaurant', 'Rollercoaster Restaurant', 'red', 240),

  prop('alton-towers-enchanted-village', 'Alton Towers Enchanted Village', 'station', 200),

  prop('the-fried-chicken-co', 'The Fried Chicken Co.', 'yellow', 260),
  prop('oblivion', 'Oblivion', 'yellow', 260),
  prop('alton-towers-spa', 'Alton Towers Spa', 'utility', 150),
  prop('the-smiler', 'The Smiler', 'yellow', 280),

  prop('the-burger-kitchen', 'The Burger Kitchen', 'green', 300),
  prop('rita', 'Rita', 'green', 300),
  prop('th13rteen', 'Th13rteen', 'green', 320),

  prop('alton-towers-splash-landings-hotel', 'Alton Towers Splash Landings Hotel', 'station', 200),

  prop('duel-the-haunted-house', 'Duel: The Haunted House Strikes Back', 'darkblue', 350),
  prop('wicker-man', 'Wicker Man', 'darkblue', 400),
]

export const altonTowers: Board = {
  id: 'alton-towers',
  name: 'Alton Towers (Wicker Man)',
  currency: 'GBP',
  locale: 'en-GB',
  startingCash: 1500,
  groupLabels: { station: 'Destinations' },
  properties,
}
