/* ──────────────────────────────────────────────
   Theme Presets — Color Palettes
   ────────────────────────────────────────────── */

export interface ThemePreset {
  id: string
  label: string
  emoji: string
  vars: Record<string, string>
}

export const THEME_PRESETS: ThemePreset[] = [
  // 1. Ruby Red (current default)
  {
    id: 'ruby_red',
    label: 'Ruby Red',
    emoji: '🔴',
    vars: {
      '--green-900': '#790E18',
      '--green-800': '#772818',
      '--green-700': '#9B111E',
      '--green-600': '#995041',
      '--green-500': '#9B4B52',
      '--green-400': '#B1636A',
      '--green-300': '#BB786A',
      '--green-200': '#C67C82',
      '--green-100': '#E0B5B9',
      '--green-50': '#F5E8EA',
      '--cream-100': '#F5EDEA',
      '--cream-200': '#EDE2DE',
      '--cream-300': '#DDD3CE',
      '--cream-50': '#FDFAF9',
      '--shadow-glow': '0 0 20px rgba(155, 17, 30, 0.2)',
    },
  },

  // 2. Emerald Green
  {
    id: 'emerald_green',
    label: 'Emerald Green',
    emoji: '🟢',
    vars: {
      '--green-900': '#0D3B1E',
      '--green-800': '#14532D',
      '--green-700': '#1B5E20',
      '--green-600': '#2E7D32',
      '--green-500': '#388E3C',
      '--green-400': '#4CAF50',
      '--green-300': '#81C784',
      '--green-200': '#A5D6A7',
      '--green-100': '#C8E6C9',
      '--green-50': '#E8F5E9',
      '--cream-100': '#F0F5EE',
      '--cream-200': '#E2EDE0',
      '--cream-300': '#D0DEC8',
      '--cream-50': '#FAFDF9',
      '--shadow-glow': '0 0 20px rgba(46, 125, 50, 0.15)',
    },
  },

  // 3. Royal Blue
  {
    id: 'royal_blue',
    label: 'Royal Blue',
    emoji: '🔵',
    vars: {
      '--green-900': '#0D1B3B',
      '--green-800': '#152853',
      '--green-700': '#1A3A8F',
      '--green-600': '#2555A4',
      '--green-500': '#3068B8',
      '--green-400': '#4A88D4',
      '--green-300': '#78A8E8',
      '--green-200': '#A5C4F2',
      '--green-100': '#D0E0F9',
      '--green-50': '#EDF3FD',
      '--cream-100': '#EEF1F5',
      '--cream-200': '#E0E5ED',
      '--cream-300': '#CED5DD',
      '--cream-50': '#F9FAFC',
      '--shadow-glow': '0 0 20px rgba(26, 58, 143, 0.15)',
    },
  },

  // 4. Deep Purple
  {
    id: 'deep_purple',
    label: 'Deep Purple',
    emoji: '🟣',
    vars: {
      '--green-900': '#1A0530',
      '--green-800': '#2C0B52',
      '--green-700': '#4A148C',
      '--green-600': '#6A1FB0',
      '--green-500': '#7E30C8',
      '--green-400': '#9C5CD4',
      '--green-300': '#B78AE8',
      '--green-200': '#D1B3F2',
      '--green-100': '#E8D6F9',
      '--green-50': '#F5EEFD',
      '--cream-100': '#F3EFF5',
      '--cream-200': '#E8E0ED',
      '--cream-300': '#DCD2E0',
      '--cream-50': '#FCFAFD',
      '--shadow-glow': '0 0 20px rgba(74, 20, 140, 0.15)',
    },
  },

  // 5. Teal
  {
    id: 'teal',
    label: 'Teal',
    emoji: '🩵',
    vars: {
      '--green-900': '#003D33',
      '--green-800': '#00534A',
      '--green-700': '#00695C',
      '--green-600': '#00897B',
      '--green-500': '#009688',
      '--green-400': '#26A69A',
      '--green-300': '#4DB6AC',
      '--green-200': '#80CBC4',
      '--green-100': '#B2DFDB',
      '--green-50': '#E0F2F1',
      '--cream-100': '#EDF5F4',
      '--cream-200': '#DEECEA',
      '--cream-300': '#CDDEDA',
      '--cream-50': '#F9FDFC',
      '--shadow-glow': '0 0 20px rgba(0, 105, 92, 0.15)',
    },
  },

  // 6. Midnight Navy
  {
    id: 'midnight_navy',
    label: 'Midnight Navy',
    emoji: '🌙',
    vars: {
      '--green-900': '#0A0A28',
      '--green-800': '#12123E',
      '--green-700': '#1A1A4E',
      '--green-600': '#2D2D70',
      '--green-500': '#3E3E8A',
      '--green-400': '#5858A8',
      '--green-300': '#7878C0',
      '--green-200': '#A0A0D4',
      '--green-100': '#CDCDE8',
      '--green-50': '#EDEDF5',
      '--cream-100': '#F0F0F5',
      '--cream-200': '#E3E3ED',
      '--cream-300': '#D3D3DD',
      '--cream-50': '#FAFAFC',
      '--shadow-glow': '0 0 20px rgba(26, 26, 78, 0.15)',
    },
  },

  // 7. Warm Brown
  {
    id: 'warm_brown',
    label: 'Warm Brown',
    emoji: '🟤',
    vars: {
      '--green-900': '#2E1B0E',
      '--green-800': '#3E2723',
      '--green-700': '#5D4037',
      '--green-600': '#6D4C41',
      '--green-500': '#795548',
      '--green-400': '#8D6E63',
      '--green-300': '#A1887F',
      '--green-200': '#BCAAA4',
      '--green-100': '#D7CCC8',
      '--green-50': '#EFEBE9',
      '--cream-100': '#F5F0EC',
      '--cream-200': '#EDE5DE',
      '--cream-300': '#DDD5CC',
      '--cream-50': '#FDFBF8',
      '--shadow-glow': '0 0 20px rgba(93, 64, 55, 0.15)',
    },
  },

  // 8. Rose Gold
  {
    id: 'rose_gold',
    label: 'Rose Gold',
    emoji: '🩷',
    vars: {
      '--green-900': '#4A2030',
      '--green-800': '#6B3548',
      '--green-700': '#B76E79',
      '--green-600': '#C08088',
      '--green-500': '#CC9298',
      '--green-400': '#D8A8AE',
      '--green-300': '#E4BFC4',
      '--green-200': '#EDD3D7',
      '--green-100': '#F5E4E7',
      '--green-50': '#FBF2F3',
      '--cream-100': '#F7F0F1',
      '--cream-200': '#EFE5E7',
      '--cream-300': '#E2D6D9',
      '--cream-50': '#FDFAFB',
      '--shadow-glow': '0 0 20px rgba(183, 110, 121, 0.15)',
    },
  },

  // 9. Slate
  {
    id: 'slate',
    label: 'Slate',
    emoji: '⚫',
    vars: {
      '--green-900': '#1C262E',
      '--green-800': '#263238',
      '--green-700': '#37474F',
      '--green-600': '#455A64',
      '--green-500': '#546E7A',
      '--green-400': '#607D8B',
      '--green-300': '#78909C',
      '--green-200': '#90A4AE',
      '--green-100': '#B0BEC5',
      '--green-50': '#ECEFF1',
      '--cream-100': '#F0F2F3',
      '--cream-200': '#E3E7E9',
      '--cream-300': '#D3D9DC',
      '--cream-50': '#FAFBFC',
      '--shadow-glow': '0 0 20px rgba(55, 71, 79, 0.15)',
    },
  },
]

/** Get theme by ID, fallback to ruby_red */
export function getThemeById(id: string): ThemePreset {
  return THEME_PRESETS.find(t => t.id === id) || THEME_PRESETS[0]
}

/** Convert theme vars to inline style string for SSR */
export function themeToStyleString(theme: ThemePreset): string {
  return Object.entries(theme.vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(';')
}
