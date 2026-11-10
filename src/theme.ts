export interface ThemeConfig {
  containerBg: string;
  headerBg: string;
  headerColor: string;
  headerBorderBottom?: string;
  fontFamily: string;
  toggleBg: string;
  toggleColor: string;
  toggleBorder?: string;
  toggleShadow?: string;
  toggleRadius?: string;
  wrapperBorder?: string;
  wrapperShadow?: string;
  wrapperRadius: string;
  inputBg: string;
  inputColor: string;
  inputBorder: string;
  inputFocusBorder: string;
  inputRadius: string;
  buttonBg: string;
  buttonColor: string;
  buttonBorder?: string;
  buttonShadow?: string;
  buttonHoverBg: string;
  buttonRadius: string;
  messagesBg: string;
  userBubbleBg: string;
  userBubbleColor: string;
  userBubbleBorder?: string;
  botBubbleBg: string;
  botBubbleColor: string;
  botBubbleBorder?: string;
  bubbleRadius: string;
  userBubbleRadius?: string;
  botBubbleRadius?: string;
  inputContainerBg: string;
  inputContainerBorderTop: string;
  suggestionBg: string;
  suggestionColor: string;
  suggestionBorder?: string;
}

export const themes: Record<string, ThemeConfig> = {
  // 1. Aptus Official (Neo-Brutalist Signature)
  aptus: {
    containerBg: '#FDF9F0',
    headerBg: '#FF4D00',
    headerColor: '#FFFFFF',
    headerBorderBottom: '3px solid #1a1a1a',
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    toggleBg: '#FF4D00',
    toggleColor: '#FFFFFF',
    toggleBorder: '3px solid #1a1a1a',
    toggleShadow: '4px 4px 0px #1a1a1a',
    toggleRadius: '0px',
    wrapperBorder: '3px solid #1a1a1a',
    wrapperShadow: '8px 8px 0px #1a1a1a',
    wrapperRadius: '0px',
    inputBg: '#FFFFFF',
    inputColor: '#1A1A1A',
    inputBorder: '2px solid #1a1a1a',
    inputFocusBorder: '2px solid #FF4D00',
    inputRadius: '0px',
    buttonBg: '#FF4D00',
    buttonColor: '#FFFFFF',
    buttonBorder: '2px solid #1a1a1a',
    buttonShadow: '3px 3px 0px #1a1a1a',
    buttonHoverBg: '#E04400',
    buttonRadius: '0px',
    messagesBg: '#FDF9F0',
    userBubbleBg: '#FF4D00',
    userBubbleColor: '#FFFFFF',
    userBubbleBorder: '2px solid #1a1a1a',
    botBubbleBg: '#FFFFFF',
    botBubbleColor: '#1A1A1A',
    botBubbleBorder: '2px solid #1a1a1a',
    bubbleRadius: '0px',
    inputContainerBg: '#FFFFFF',
    inputContainerBorderTop: '3px solid #1a1a1a',
    suggestionBg: '#BFF000',
    suggestionColor: '#1A1A1A',
    suggestionBorder: '2px solid #1a1a1a',
  },

  // 2. Boty E-Commerce (Natural Warm Olive)
  boty: {
    containerBg: '#F7F4EF',
    headerBg: '#4F5B3A',
    headerColor: '#F7F4EF',
    fontFamily: "'Inter', system-ui, sans-serif",
    toggleBg: '#4F5B3A',
    toggleColor: '#F7F4EF',
    toggleShadow: '0 4px 14px rgba(79, 91, 58, 0.25)',
    toggleRadius: '50%',
    wrapperBorder: '1px solid #D8CFC4',
    wrapperShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    wrapperRadius: '24px',
    inputBg: '#FFFFFF',
    inputColor: '#2C2C2C',
    inputBorder: '1px solid #D8CFC4',
    inputFocusBorder: '1px solid #4F5B3A',
    inputRadius: '16px',
    buttonBg: '#4F5B3A',
    buttonColor: '#F7F4EF',
    buttonHoverBg: '#3D472D',
    buttonRadius: '16px',
    messagesBg: '#F7F4EF',
    userBubbleBg: '#4F5B3A',
    userBubbleColor: '#F7F4EF',
    botBubbleBg: '#EDE6DC',
    botBubbleColor: '#2C2C2C',
    bubbleRadius: '20px',
    inputContainerBg: '#F7F4EF',
    inputContainerBorderTop: '1px solid #D8CFC4',
    suggestionBg: '#B8ADA3',
    suggestionColor: '#2C2C2C',
  },

  // 3. ChatGPT Minimal Dark
  chatgpt: {
    containerBg: '#212121',
    headerBg: '#2F2F2F',
    headerColor: '#FFFFFF',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    toggleBg: '#10A37F',
    toggleColor: '#FFFFFF',
    toggleShadow: '0 4px 12px rgba(16, 163, 127, 0.3)',
    toggleRadius: '12px',
    wrapperBorder: '1px solid #3E3E3E',
    wrapperShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
    wrapperRadius: '12px',
    inputBg: '#2F2F2F',
    inputColor: '#FFFFFF',
    inputBorder: '1px solid #424242',
    inputFocusBorder: '1px solid #10A37F',
    inputRadius: '8px',
    buttonBg: '#10A37F',
    buttonColor: '#FFFFFF',
    buttonHoverBg: '#0D8C6D',
    buttonRadius: '8px',
    messagesBg: '#212121',
    userBubbleBg: '#2F2F2F',
    userBubbleColor: '#FFFFFF',
    botBubbleBg: '#171717',
    botBubbleColor: '#ECECEC',
    bubbleRadius: '8px',
    inputContainerBg: '#212121',
    inputContainerBorderTop: '1px solid #2F2F2F',
    suggestionBg: '#2F2F2F',
    suggestionColor: '#10A37F',
  },

  // 4. Compute AI Agent (Cyber Code Terminal)
  compute: {
    containerBg: '#0C0E12',
    headerBg: '#181C24',
    headerColor: '#38BDF8',
    headerBorderBottom: '1px solid #1E293B',
    fontFamily: "'JetBrains Mono', monospace",
    toggleBg: '#181C24',
    toggleColor: '#38BDF8',
    toggleBorder: '1px solid #38BDF8',
    toggleShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
    toggleRadius: '6px',
    wrapperBorder: '1px solid #1E293B',
    wrapperShadow: '0 15px 35px rgba(0,0,0,0.7)',
    wrapperRadius: '6px',
    inputBg: '#111622',
    inputColor: '#F1F5F9',
    inputBorder: '1px solid #334155',
    inputFocusBorder: '1px solid #38BDF8',
    inputRadius: '4px',
    buttonBg: '#38BDF8',
    buttonColor: '#0C0E12',
    buttonHoverBg: '#0284C7',
    buttonRadius: '4px',
    messagesBg: '#0C0E12',
    userBubbleBg: '#1E293B',
    userBubbleColor: '#38BDF8',
    userBubbleBorder: '1px solid #38BDF8',
    botBubbleBg: '#181C24',
    botBubbleColor: '#F1F5F9',
    botBubbleBorder: '1px solid #334155',
    bubbleRadius: '6px',
    inputContainerBg: '#111622',
    inputContainerBorderTop: '1px solid #1E293B',
    suggestionBg: '#1E293B',
    suggestionColor: '#38BDF8',
    suggestionBorder: '1px solid #38BDF8',
  },

  // 5. Crosshaven (Corporate Luxury Slate Navy)
  crosshaven: {
    containerBg: '#F8FAFC',
    headerBg: '#0F172A',
    headerColor: '#FFFFFF',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    toggleBg: '#2563EB',
    toggleColor: '#FFFFFF',
    toggleShadow: '0 6px 16px rgba(37, 99, 235, 0.25)',
    toggleRadius: '50%',
    wrapperBorder: '1px solid #E2E8F0',
    wrapperShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
    wrapperRadius: '10px',
    inputBg: '#FFFFFF',
    inputColor: '#0F172A',
    inputBorder: '1px solid #CBD5E1',
    inputFocusBorder: '1px solid #2563EB',
    inputRadius: '6px',
    buttonBg: '#2563EB',
    buttonColor: '#FFFFFF',
    buttonHoverBg: '#1D4ED8',
    buttonRadius: '6px',
    messagesBg: '#F8FAFC',
    userBubbleBg: '#2563EB',
    userBubbleColor: '#FFFFFF',
    botBubbleBg: '#E2E8F0',
    botBubbleColor: '#0F172A',
    bubbleRadius: '10px',
    inputContainerBg: '#FFFFFF',
    inputContainerBorderTop: '1px solid #E2E8F0',
    suggestionBg: '#DBEAFE',
    suggestionColor: '#1E40AF',
  },

  // 6. Studio (Modern Dark Tool)
  studio: {
    containerBg: '#0A0A0A',
    headerBg: '#1A1A1A',
    headerColor: '#FFD600',
    headerBorderBottom: '1px solid #2D2D2D',
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    toggleBg: '#FFD600',
    toggleColor: '#0A0A0A',
    toggleBorder: '2px solid #2D2D2D',
    toggleShadow: '0 4px 14px rgba(255, 214, 0, 0.2)',
    toggleRadius: '30px',
    wrapperBorder: '2px solid #2D2D2D',
    wrapperShadow: '0 12px 30px rgba(0,0,0,0.8)',
    wrapperRadius: '24px',
    inputBg: '#141414',
    inputColor: '#F5F5F0',
    inputBorder: '1px solid #2D2D2D',
    inputFocusBorder: '1px solid #FFD600',
    inputRadius: '30px',
    buttonBg: '#FFD600',
    buttonColor: '#0A0A0A',
    buttonHoverBg: '#E6C200',
    buttonRadius: '30px',
    messagesBg: '#0A0A0A',
    userBubbleBg: '#FF6B35',
    userBubbleColor: '#FFFFFF',
    botBubbleBg: '#1A1A1A',
    botBubbleColor: '#F5F5F0',
    botBubbleBorder: '1px solid #2D2D2D',
    bubbleRadius: '20px',
    inputContainerBg: '#141414',
    inputContainerBorderTop: '1px solid #2D2D2D',
    suggestionBg: '#2D2D2D',
    suggestionColor: '#FFD600',
  },

  // 7. Energy (Gen-Z Neon Punch)
  energy: {
    containerBg: '#3B0764',
    headerBg: '#581C87',
    headerColor: '#A3E635',
    fontFamily: "'Outfit', system-ui, sans-serif",
    toggleBg: '#A3E635',
    toggleColor: '#3B0764',
    toggleShadow: '0 0 20px rgba(163, 230, 53, 0.4)',
    toggleRadius: '12px',
    wrapperBorder: '2px solid #A3E635',
    wrapperShadow: '0 10px 30px rgba(163, 230, 53, 0.2)',
    wrapperRadius: '12px',
    inputBg: '#2E1065',
    inputColor: '#FFFFFF',
    inputBorder: '2px solid #EC4899',
    inputFocusBorder: '2px solid #A3E635',
    inputRadius: '12px',
    buttonBg: '#EC4899',
    buttonColor: '#FFFFFF',
    buttonHoverBg: '#DB2777',
    buttonRadius: '12px',
    messagesBg: '#3B0764',
    userBubbleBg: '#EC4899',
    userBubbleColor: '#FFFFFF',
    botBubbleBg: '#581C87',
    botBubbleColor: '#A3E635',
    bubbleRadius: '12px',
    inputContainerBg: '#2E1065',
    inputContainerBorderTop: '2px solid #581C87',
    suggestionBg: '#A3E635',
    suggestionColor: '#3B0764',
  },

  // 8. Smart Home (Clean Soft Cyan)
  smarthome: {
    containerBg: '#F0F9FF',
    headerBg: '#0EA5E9',
    headerColor: '#FFFFFF',
    fontFamily: "'Inter', system-ui, sans-serif",
    toggleBg: '#0EA5E9',
    toggleColor: '#FFFFFF',
    toggleShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
    toggleRadius: '50%',
    wrapperBorder: '1px solid #BAE6FD',
    wrapperShadow: '0 10px 25px rgba(14, 165, 233, 0.1)',
    wrapperRadius: '30px',
    inputBg: '#FFFFFF',
    inputColor: '#0F172A',
    inputBorder: '1px solid #BAE6FD',
    inputFocusBorder: '1px solid #0EA5E9',
    inputRadius: '30px',
    buttonBg: '#0EA5E9',
    buttonColor: '#FFFFFF',
    buttonHoverBg: '#0284C7',
    buttonRadius: '30px',
    messagesBg: '#F0F9FF',
    userBubbleBg: '#0EA5E9',
    userBubbleColor: '#FFFFFF',
    botBubbleBg: '#E0F2FE',
    botBubbleColor: '#0369A1',
    bubbleRadius: '24px',
    inputContainerBg: '#FFFFFF',
    inputContainerBorderTop: '1px solid #BAE6FD',
    suggestionBg: '#E0F2FE',
    suggestionColor: '#0284C7',
  },

  // 9. Superdesign (Creative Purple Violet)
  superdesign: {
    containerBg: '#F3E8FF',
    headerBg: '#4C1D95',
    headerColor: '#FFFFFF',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    toggleBg: '#8B5CF6',
    toggleColor: '#FFFFFF',
    toggleShadow: '0 6px 16px rgba(139, 92, 246, 0.3)',
    toggleRadius: '50%',
    wrapperBorder: '1px solid #DDD6FE',
    wrapperShadow: '0 12px 28px rgba(76, 29, 149, 0.15)',
    wrapperRadius: '12px',
    inputBg: '#FFFFFF',
    inputColor: '#3B0764',
    inputBorder: '1px solid #C4B5FD',
    inputFocusBorder: '1px solid #8B5CF6',
    inputRadius: '8px',
    buttonBg: '#8B5CF6',
    buttonColor: '#FFFFFF',
    buttonHoverBg: '#7C3AED',
    buttonRadius: '8px',
    messagesBg: '#F3E8FF',
    userBubbleBg: '#8B5CF6',
    userBubbleColor: '#FFFFFF',
    botBubbleBg: '#E9D5FF',
    botBubbleColor: '#4C1D95',
    bubbleRadius: '12px',
    inputContainerBg: '#FFFFFF',
    inputContainerBorderTop: '1px solid #DDD6FE',
    suggestionBg: '#DDD6FE',
    suggestionColor: '#5B21B6',
  },

  // 10. Professional (Classic Blue Business)
  professional: {
    containerBg: '#FFFFFF',
    headerBg: '#1D4ED8',
    headerColor: '#FFFFFF',
    fontFamily: "'Inter', system-ui, sans-serif",
    toggleBg: '#1D4ED8',
    toggleColor: '#FFFFFF',
    toggleShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
    toggleRadius: '8px',
    wrapperBorder: '1px solid #E2E8F0',
    wrapperShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    wrapperRadius: '4px',
    inputBg: '#F8FAFC',
    inputColor: '#0F172A',
    inputBorder: '1px solid #CBD5E1',
    inputFocusBorder: '1px solid #1D4ED8',
    inputRadius: '4px',
    buttonBg: '#1D4ED8',
    buttonColor: '#FFFFFF',
    buttonHoverBg: '#1E40AF',
    buttonRadius: '4px',
    messagesBg: '#F8FAFC',
    userBubbleBg: '#1D4ED8',
    userBubbleColor: '#FFFFFF',
    botBubbleBg: '#E2E8F0',
    botBubbleColor: '#0F172A',
    bubbleRadius: '6px',
    inputContainerBg: '#FFFFFF',
    inputContainerBorderTop: '1px solid #E2E8F0',
    suggestionBg: '#DBEAFE',
    suggestionColor: '#1E40AF',
  },

  // 11. GitHub (GitHub Dark Mode)
  github: {
    containerBg: '#0D1117',
    headerBg: '#161B22',
    headerColor: '#F0F6FC',
    headerBorderBottom: '1px solid #30363D',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    toggleBg: '#238636',
    toggleColor: '#FFFFFF',
    toggleBorder: '1px solid rgba(240, 246, 252, 0.1)',
    toggleShadow: '0 4px 14px rgba(35, 134, 54, 0.3)',
    toggleRadius: '50%',
    wrapperBorder: '1px solid #30363D',
    wrapperShadow: '0 12px 32px rgba(1, 4, 9, 0.85)',
    wrapperRadius: '6px',
    inputBg: '#010409',
    inputColor: '#C9D1D9',
    inputBorder: '1px solid #30363D',
    inputFocusBorder: '1px solid #58A6FF',
    inputRadius: '6px',
    buttonBg: '#238636',
    buttonColor: '#FFFFFF',
    buttonBorder: '1px solid rgba(240, 246, 252, 0.1)',
    buttonHoverBg: '#2EA043',
    buttonRadius: '6px',
    messagesBg: '#0D1117',
    userBubbleBg: '#238636',
    userBubbleColor: '#FFFFFF',
    botBubbleBg: '#161B22',
    botBubbleColor: '#C9D1D9',
    botBubbleBorder: '1px solid #30363D',
    bubbleRadius: '6px',
    inputContainerBg: '#161B22',
    inputContainerBorderTop: '1px solid #30363D',
    suggestionBg: '#21262D',
    suggestionColor: '#58A6FF',
    suggestionBorder: '1px solid #30363D',
  },

  // 12. Dracula (Official Dracula Theme)
  dracula: {
    containerBg: '#282A36',
    headerBg: '#6272A4',
    headerColor: '#F8F8F2',
    headerBorderBottom: '1px solid #44475A',
    fontFamily: "'Fira Code', monospace, sans-serif",
    toggleBg: '#BD93F9',
    toggleColor: '#282A36',
    toggleShadow: '0 4px 14px rgba(189, 147, 249, 0.35)',
    toggleRadius: '16px',
    wrapperBorder: '1px solid #44475A',
    wrapperShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
    wrapperRadius: '16px',
    inputBg: '#44475A',
    inputColor: '#F8F8F2',
    inputBorder: '1px solid #6272A4',
    inputFocusBorder: '1px solid #FF79C6',
    inputRadius: '12px',
    buttonBg: '#FF79C6',
    buttonColor: '#282A36',
    buttonHoverBg: '#FF92D0',
    buttonRadius: '12px',
    messagesBg: '#282A36',
    userBubbleBg: '#FF79C6',
    userBubbleColor: '#282A36',
    botBubbleBg: '#44475A',
    botBubbleColor: '#F8F8F2',
    bubbleRadius: '16px',
    inputContainerBg: '#282A36',
    inputContainerBorderTop: '1px solid #44475A',
    suggestionBg: '#44475A',
    suggestionColor: '#8BE9FD',
    suggestionBorder: '1px solid #6272A4',
  },

  // 13. Nord (Arctic Polar Frost Theme)
  nord: {
    containerBg: '#2E3440',
    headerBg: '#3B4252',
    headerColor: '#88C0D0',
    headerBorderBottom: '1px solid #4C566A',
    fontFamily: "'Rubik', system-ui, sans-serif",
    toggleBg: '#88C0D0',
    toggleColor: '#2E3440',
    toggleShadow: '0 4px 14px rgba(136, 192, 208, 0.3)',
    toggleRadius: '50%',
    wrapperBorder: '1px solid #4C566A',
    wrapperShadow: '0 10px 28px rgba(0, 0, 0, 0.4)',
    wrapperRadius: '8px',
    inputBg: '#3B4252',
    inputColor: '#ECEFF4',
    inputBorder: '1px solid #4C566A',
    inputFocusBorder: '1px solid #88C0D0',
    inputRadius: '6px',
    buttonBg: '#88C0D0',
    buttonColor: '#2E3440',
    buttonHoverBg: '#81A1C1',
    buttonRadius: '6px',
    messagesBg: '#2E3440',
    userBubbleBg: '#81A1C1',
    userBubbleColor: '#2E3440',
    botBubbleBg: '#3B4252',
    botBubbleColor: '#ECEFF4',
    bubbleRadius: '8px',
    inputContainerBg: '#3B4252',
    inputContainerBorderTop: '1px solid #4C566A',
    suggestionBg: '#4C566A',
    suggestionColor: '#88C0D0',
  },

  // 14. Cyberpunk (Cyberpunk 2077 Neon Yellow/Cyan)
  cyberpunk: {
    containerBg: '#050505',
    headerBg: '#FCEE09',
    headerColor: '#050505',
    headerBorderBottom: '2px solid #00F0FF',
    fontFamily: "'Orbitron', 'Space Grotesk', sans-serif",
    toggleBg: '#FCEE09',
    toggleColor: '#050505',
    toggleBorder: '2px solid #00F0FF',
    toggleShadow: '0 0 15px rgba(252, 238, 9, 0.6)',
    toggleRadius: '0px',
    wrapperBorder: '2px solid #FCEE09',
    wrapperShadow: '0 0 25px rgba(0, 240, 255, 0.35)',
    wrapperRadius: '0px',
    inputBg: '#121212',
    inputColor: '#FCEE09',
    inputBorder: '1px solid #00F0FF',
    inputFocusBorder: '1px solid #FF0055',
    inputRadius: '0px',
    buttonBg: '#FF0055',
    buttonColor: '#FFFFFF',
    buttonBorder: '1px solid #00F0FF',
    buttonHoverBg: '#E0004B',
    buttonRadius: '0px',
    messagesBg: '#050505',
    userBubbleBg: '#FF0055',
    userBubbleColor: '#FFFFFF',
    userBubbleBorder: '1px solid #FCEE09',
    botBubbleBg: '#121212',
    botBubbleColor: '#00F0FF',
    botBubbleBorder: '1px solid #00F0FF',
    bubbleRadius: '0px',
    inputContainerBg: '#121212',
    inputContainerBorderTop: '2px solid #00F0FF',
    suggestionBg: '#121212',
    suggestionColor: '#FCEE09',
    suggestionBorder: '1px solid #FCEE09',
  },
};

// Helper function to dynamically load Google Fonts in browser environment
const loadedFonts = new Set<string>();

export function loadGoogleFont(fontFamily: string) {
  if (typeof document === 'undefined') return;

  const fontNames = fontFamily.split(',').map(f => f.trim().replace(/^['"]|['"]$/g, ''));
  const systemFonts = [
    'system-ui', '-apple-system', 'sans-serif', 'serif', 'monospace',
    'Helvetica', 'Arial', 'Segoe UI', 'BlinkMacSystemFont', 'Noto Sans',
    'Georgia', 'Geist', 'Geist Fallback', 'Söhne', 'Cabinet Grotesk', 'Signifier'
  ];

  for (const fontName of fontNames) {
    if (!fontName || systemFonts.includes(fontName) || loadedFonts.has(fontName)) {
      continue;
    }

    loadedFonts.add(fontName);
    const fontSlug = fontName.replace(/ /g, '+');
    const linkId = `google-font-${fontSlug.toLowerCase()}`;
    if (document.getElementById(linkId)) continue;

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontSlug}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }
}

// Helper function to resolve theme config with optional custom borderRadius, toggleBtnRadius, and fontFamily overrides
export function getThemeConfig(
  themeKey?: string,
  customRadius?: string | number,
  customToggleRadius?: string | number,
  customFontFamily?: string
): ThemeConfig {
  const key = (themeKey || 'aptus').toLowerCase();
  let baseConfig = themes[key];

  if (!baseConfig) {
    if (key === 'primary') baseConfig = themes.aptus;
    else if (key === 'secondary') baseConfig = themes.crosshaven;
    else if (key === 'tech') baseConfig = themes.compute;
    else baseConfig = themes.aptus;
  }

  const finalFontFamily = customFontFamily || baseConfig.fontFamily;
  loadGoogleFont(finalFontFamily);

  // Format radius strings - treat empty string, null, or 'default' as undefined so baseConfig theme defaults are used
  const hasCustomRadius = customRadius !== undefined && customRadius !== null && customRadius !== '' && customRadius !== 'default';
  const formattedRadius = hasCustomRadius
    ? typeof customRadius === 'number' ? `${customRadius}px` : customRadius
    : undefined;

  const hasCustomToggleRadius = customToggleRadius !== undefined && customToggleRadius !== null && customToggleRadius !== '' && customToggleRadius !== 'default';
  const formattedToggleRadius = hasCustomToggleRadius
    ? typeof customToggleRadius === 'number' ? `${customToggleRadius}px` : customToggleRadius
    : undefined;

  const resolvedBubbleRadius = formattedRadius ?? baseConfig.bubbleRadius;

  return {
    ...baseConfig,
    fontFamily: finalFontFamily,
    wrapperRadius: formattedRadius ?? baseConfig.wrapperRadius,
    inputRadius: formattedRadius ?? baseConfig.inputRadius,
    buttonRadius: formattedRadius ?? baseConfig.buttonRadius,
    bubbleRadius: resolvedBubbleRadius,
    userBubbleRadius: resolvedBubbleRadius,
    botBubbleRadius: resolvedBubbleRadius,
    toggleRadius: formattedToggleRadius ?? (formattedRadius ?? baseConfig.toggleRadius ?? baseConfig.wrapperRadius),
  };
}
