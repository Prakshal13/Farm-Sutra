// Farm Sutra design tokens — Theme F "Sunrise Contrast"
// Deep terracotta-brown dark surfaces + warm straw-light body + a single teal accent.
// Import these instead of hardcoding hex values inside screen StyleSheets, so every
// screen shares one palette instead of each screen inventing its own colors.

export const COLORS = {
    // Dark surfaces — headers, nav bands, the "entry moment" tone
    bgDark: '#2E1B12',
    bgDarkElevated: '#3D2618',
    textOnDark: '#F5EBD8',
    textOnDarkMuted: '#C9B49B',

    // Light surfaces — screen body
    bgLight: '#F5EBD8',
    surface: '#FFFFFF',
    surfaceMuted: '#FBF6EC',
    border: '#E5D9BF',

    // Text on light surfaces
    textPrimary: '#2E1B12',
    textSecondary: '#7A5A44',
    textMuted: '#A08A72',

    // Accent — teal. Reserved for primary actions, verification, and key data.
    accent: '#1D9E75',
    accentDark: '#146B50',
    accentSoft: '#E3F3EC',

    // Secondary highlight — gold. Used sparingly, for ratings/stars only.
    gold: '#D9A521',
    goldSoft: '#FBF1DC',

    // Semantic — kept close to convention so alerts stay instantly recognizable
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
    warning: '#D97706',
    warningSoft: '#FEF3C7',
} as const;

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
} as const;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
} as const;

export const TYPE = {
    caption: 12,
    body: 14,
    subtitle: 15,
    title: 17,
    heading: 20,
    display: 26,
} as const;