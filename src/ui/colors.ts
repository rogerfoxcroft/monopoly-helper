import type { Board, Group } from '../domain/types'

export interface GroupMeta {
  label: string
  /** Swatch background colour (matches the board's colour band). */
  swatch: string
  /** Readable text/icon colour on top of the swatch. */
  on: string
}

export const GROUP_META: Record<Group, GroupMeta> = {
  brown: { label: 'Brown', swatch: '#8b5a2b', on: '#ffffff' },
  lightblue: { label: 'Light Blue', swatch: '#aae0fa', on: '#0f172a' },
  pink: { label: 'Pink', swatch: '#d93a96', on: '#ffffff' },
  orange: { label: 'Orange', swatch: '#f7941d', on: '#0f172a' },
  red: { label: 'Red', swatch: '#ed1b24', on: '#ffffff' },
  yellow: { label: 'Yellow', swatch: '#fde047', on: '#0f172a' },
  green: { label: 'Green', swatch: '#1fb25a', on: '#ffffff' },
  darkblue: { label: 'Dark Blue', swatch: '#0072bb', on: '#ffffff' },
  station: { label: 'Stations', swatch: '#334155', on: '#ffffff' },
  utility: { label: 'Utilities', swatch: '#94a3b8', on: '#0f172a' },
}

/** The label for a group on a given board, honouring edition overrides. */
export function groupLabel(board: Board, group: Group): string {
  return board.groupLabels?.[group] ?? GROUP_META[group].label
}

/** Display order for grouped property lists. */
export const GROUP_ORDER: Group[] = [
  'brown',
  'lightblue',
  'pink',
  'orange',
  'red',
  'yellow',
  'green',
  'darkblue',
  'station',
  'utility',
]
