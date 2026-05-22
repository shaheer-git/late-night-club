export const Colors = {
  // Core
  dark: '#2C2C2C',
  white: '#FFFFFF',
  lime: '#C6FF34',
  purple: '#7E3BED',
  purpleLight: '#F2EBFD',

  // Backgrounds
  mapBg: '#1E1E1E',
  darkBg: '#30343F',
  cardBg: 'rgba(255,255,255,0.08)',
  overlayBg: 'rgba(44,44,44,0.5)',

  // Text
  textPrimary: '#2C2C2C',
  textWhite: '#FFFFFF',
  textFaint: '#FAFAFF',
  textSecondary: 'rgba(255,255,255,0.5)',
  textMuted: 'rgba(44,44,44,0.5)',
  textGreen: '#22C55E',
  textSlate: '#64748B',
  textAmber: '#F59E0B',

  // UI
  border: 'rgba(0,0,0,0.08)',
  borderFaint: 'rgba(255,255,255,0.2)',
  inputBg: '#F8FAFC',
  divider: 'rgba(255,255,255,0.5)',
  communityBg: '#F1F6FF',
  communityText: '#0F1724',

  // Status
  statusOpen: '#22C55E',
  statusClosed: '#EF4444',
  statusUnknown: '#F59E0B',
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 28,
  xxl: 38,
  full: 100,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 28,
  display: 34,
};

// Authentication Screen Design Tokens
export const AuthColors = {
  // Backgrounds
  screenBg: '#2C2C2C',
  decorativeCircle: 'rgba(126, 59, 237, 0.05)',
  decorativeCircleAlt: 'rgba(126, 59, 237, 0.08)',
  
  // Interactive Elements
  inputBg: '#FFFFFF',
  inputPlaceholder: '#2C2C2C',
  buttonPrimary: '#C6FF34',
  buttonPrimaryText: '#2C2C2C',
  backButtonBg: 'rgba(255, 255, 255, 0.1)',
  
  // OTP Specific
  otpBoxEmpty: 'rgba(255, 255, 255, 0.1)',
  otpBoxEmptyBorder: 'rgba(255, 255, 255, 0.2)',
  otpBoxFilled: '#C6FF34',
  otpBoxFilledText: '#2C2C2C',
  
  // Text
  titleText: '#FFFFFF',
  bodyText: '#FFFFFF',
  mutedText: 'rgba(255, 255, 255, 0.5)',
  linkText: '#FFFFFF',
  
  // Divider
  dividerLine: 'rgba(255, 255, 255, 0.5)',
};

export const AuthSpacing = {
  screenPadding: 24,
  screenPaddingAlt: 23,
  inputGap: 16,
  sectionGap: 14,
  backButtonOffset: 10,
  titleMarginBottom: 24,
  otpBoxGap: 12,
};

export const AuthTypography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 40,
    color: AuthColors.titleText,
  },
  input: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: AuthColors.inputPlaceholder,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: AuthColors.buttonPrimaryText,
  },
  link: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: AuthColors.mutedText,
  },
  linkAccent: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: AuthColors.linkText,
  },
  otpDigit: {
    fontSize: 28,
    fontWeight: '600' as const,
  },
  termsText: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: AuthColors.mutedText,
  },
};

export const AuthLayout = {
  inputHeight: 58,
  buttonHeight: 68,
  backButtonSize: 44,
  otpBoxSize: 70,
  checkboxSize: 24,
  logoSize: 80,
  borderRadius: {
    input: 8,
    button: 8,
    otpBox: 6,
    checkbox: 4,
  },
  decorativeCircle: {
    top: 129,
    left: 115,
    size1: 162,
    size2: 161,
  },
};
