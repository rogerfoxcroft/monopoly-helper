import type { Board, Group, PropertyDef } from '../domain/types'

/** House/hotel cost per colour group on the standard UK board. */
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

// Listed in board order (GO → clockwise) so the UI can present them naturally.
const properties: PropertyDef[] = [
  prop('old-kent-road', 'Old Kent Road', 'brown', 60),
  prop('whitechapel-road', 'Whitechapel Road', 'brown', 60),

  prop('kings-cross', "King's Cross Station", 'station', 200),

  prop('the-angel-islington', 'The Angel Islington', 'lightblue', 100),
  prop('euston-road', 'Euston Road', 'lightblue', 100),
  prop('pentonville-road', 'Pentonville Road', 'lightblue', 120),

  prop('pall-mall', 'Pall Mall', 'pink', 140),
  prop('electric-company', 'Electric Company', 'utility', 150),
  prop('whitehall', 'Whitehall', 'pink', 140),
  prop('northumberland-avenue', 'Northumberland Avenue', 'pink', 160),

  prop('marylebone', 'Marylebone Station', 'station', 200),

  prop('bow-street', 'Bow Street', 'orange', 180),
  prop('marlborough-street', 'Marlborough Street', 'orange', 180),
  prop('vine-street', 'Vine Street', 'orange', 200),

  prop('strand', 'Strand', 'red', 220),
  prop('fleet-street', 'Fleet Street', 'red', 220),
  prop('trafalgar-square', 'Trafalgar Square', 'red', 240),

  prop('fenchurch-street', 'Fenchurch Street Station', 'station', 200),

  prop('leicester-square', 'Leicester Square', 'yellow', 260),
  prop('coventry-street', 'Coventry Street', 'yellow', 260),
  prop('water-works', 'Water Works', 'utility', 150),
  prop('piccadilly', 'Piccadilly', 'yellow', 280),

  prop('regent-street', 'Regent Street', 'green', 300),
  prop('oxford-street', 'Oxford Street', 'green', 300),
  prop('bond-street', 'Bond Street', 'green', 320),

  prop('liverpool-street', 'Liverpool Street Station', 'station', 200),

  prop('park-lane', 'Park Lane', 'darkblue', 350),
  prop('mayfair', 'Mayfair', 'darkblue', 400),
]

export const standardUk: Board = {
  id: 'standard-uk',
  name: 'Standard (UK)',
  currency: 'GBP',
  locale: 'en-GB',
  startingCash: 1500,
  properties,
}
