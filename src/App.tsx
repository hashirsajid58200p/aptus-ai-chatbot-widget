import React, { ReactNode, useEffect, useState } from 'react';
import { AiOutlineWarning } from 'react-icons/ai';
import { TbMessageChatbot, TbUserHeart, TbRobot, TbRobotFace } from 'react-icons/tb';
import { RiRobot2Line, RiRobot3Line, RiRobotLine, RiSparklingFill, RiCustomerService2Line, RiShieldCheckLine, RiQuestionAnswerLine } from 'react-icons/ri';
import { FaRobot } from 'react-icons/fa';
import styled from 'styled-components';
import Chatbot from './components/chatbot';
import getChatbotDetails from './utils/getChatbotDetails';
import { getThemeConfig, ThemeConfig } from './theme';

export type WidgetThemeName = 
  | 'aptus'
  | 'boty'
  | 'chatgpt'
  | 'compute'
  | 'crosshaven'
  | 'studio'
  | 'energy'
  | 'smarthome'
  | 'superdesign'
  | 'professional'
  | 'github'
  | 'dracula'
  | 'nord'
  | 'cyberpunk'
  | 'primary'
  | 'secondary'
  | 'tech'
  | string;

export interface AppProps {
  icon?: ReactNode;
  toggleBtnBgColor?: string;
  toggleBtncolor?: string;
  animate?: boolean;
  token?: string;
  apiUrl?: string;
  theme?: WidgetThemeName;
  position?: 'left' | 'right';
  wantToShowSuggestions?: boolean;
  borderRadius?: string | number;
  toggleBtnRadius?: string | number;
  fontFamily?: string;
  primaryColor?: string;
  textColor?: string;
  chatbotAvatar?: string | ReactNode;
  welcomeMessage?: string;
  botName?: string;
}

export interface ChatbotDetails {
  id: string;
  bussinessName: string;
  bussinessCategory: string;
  bussinessDescription: string;
  bussinessDetails: {
    question: string;
    answer: string;
  }[];
  theme?: string;
  primaryColor?: string;
  textColor?: string;
  borderRadius?: string;
  botName?: string;
  welcomeMessage?: string;
  chatbotAvatar?: string;
  allowedDomains?: string[];
}

export function getContrastColor(hexColor?: string): string {
  if (!hexColor || hexColor.startsWith('rgba')) return '#FFFFFF';
  const hex = hexColor.replace('#', '');
  if (hex.length < 6) return '#FFFFFF';
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 145 ? '#111827' : '#FFFFFF';
}

export function renderAvatarIcon(avatar?: string | ReactNode, size = 28, color?: string) {
  if (!avatar || avatar === 'bot' || avatar === 'default') {
    return <RiRobot2Line size={size} color={color} />;
  }
  if (avatar === 'cyber') return <FaRobot size={size} color={color} />;
  if (avatar === 'android') return <TbRobot size={size} color={color} />;
  if (avatar === 'mecha') return <TbRobotFace size={size} color={color} />;
  if (avatar === 'friendly') return <RiRobot2Line size={size} color={color} />;
  if (avatar === 'futuristic') return <RiRobot3Line size={size} color={color} />;
  if (avatar === 'smart') return <RiRobotLine size={size} color={color} />;
  if (avatar === 'sparkles' || avatar === 'spark') return <RiSparklingFill size={size} color={color} />;
  if (avatar === 'chat' || avatar === 'message') return <TbMessageChatbot size={size} color={color} />;
  if (avatar === 'agent' || avatar === 'support') return <RiCustomerService2Line size={size} color={color} />;
  if (avatar === 'concierge' || avatar === 'assistant') return <TbUserHeart size={size} color={color} />;
  if (avatar === 'shield' || avatar === 'security') return <RiShieldCheckLine size={size} color={color} />;
  if (avatar === 'faq' || avatar === 'help') return <RiQuestionAnswerLine size={size} color={color} />;

  // Legacy mappings for backward compatibility
  if (avatar === 'brain') return <RiRobot2Line size={size} color={color} />;
  if (avatar === 'cpu') return <TbMessageChatbot size={size} color={color} />;
  if (avatar === 'zap') return <RiSparklingFill size={size} color={color} />;
  if (avatar === 'wand') return <RiCustomerService2Line size={size} color={color} />;

  if (
    typeof avatar === 'string' &&
    (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:image/'))
  ) {
    return (
      <img
        src={avatar}
        alt="Avatar"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
        style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  return <RiRobot2Line size={size} color={color} />;
}

// App container
const AppContainer = styled.div<{ $fontFamily: string }>`
  font-family: ${({ $fontFamily }) => $fontFamily};
`;

// Chatbot Toggle Button
const ChatbotToggleButton = styled.div<{ $position: string; $config: ThemeConfig; $animate: boolean }>`
  @keyframes aptusBounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
    60% {
      transform: translateY(-4px);
    }
  }

  position: fixed;
  bottom: 20px;
  ${({ $position }) => ($position === 'left' ? 'left: 20px;' : 'right: 20px;')}
  width: 60px;
  height: 60px;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: ${({ $config }) => $config.toggleRadius || $config.wrapperRadius};
  border: ${({ $config }) => $config.toggleBorder || 'none'};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ $config }) => $config.toggleShadow || '0 4px 12px rgba(0, 0, 0, 0.15)'};
  background-color: ${({ $config }) => $config.toggleBg};
  color: ${({ $config }) => $config.toggleColor};
  transition: transform 0.15s ease-in-out, background-color 0.2s, color 0.2s, box-shadow 0.15s;
  animation: ${(props) => (props.$animate ? 'aptusBounce 1.2s infinite ease-in-out' : 'none')};
  z-index: 999999;

  &:hover {
    transform: scale(1.08);
  }
`;

// Chatbot Wrapper
const ChatbotWrapper = styled.div<{ $show: boolean; $position: string; $config: ThemeConfig }>`
  position: fixed;
  bottom: 20px;
  ${({ $position }) => ($position === 'left' ? 'left: 20px;' : 'right: 20px;')}
  width: 400px;
  height: 600px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 40px);
  box-sizing: border-box;
  border-radius: ${({ $config }) => $config.wrapperRadius};
  border: ${({ $config }) => $config.wrapperBorder};
  box-shadow: ${({ $config }) => $config.wrapperShadow};
  overflow: hidden;
  z-index: 999999;
  display: ${({ $show }) => ($show ? 'flex' : 'none')};
  flex-direction: column;
  background-color: ${({ $config }) => $config.containerBg};

  @media (max-width: 480px) {
    bottom: 0;
    right: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    max-width: 100vw;
    max-height: 100dvh;
    border-radius: 0;
    border: none;
  }
`;

// Loader
const Loader = styled.div<{ $config: ThemeConfig }>`
  @keyframes aptusSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: ${({ $config }) => $config.headerBg};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: aptusSpin 1s linear infinite;
  margin: auto;
`;

// Error Container
const ErrorContainer = styled.div<{ $config: ThemeConfig }>`
  padding: 24px 16px;
  text-align: center;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  background-color: ${({ $config }) => $config.containerBg};
`;

const App: React.FC<AppProps> = ({
  icon,
  toggleBtnBgColor,
  toggleBtncolor,
  animate = true,
  token: propToken,
  apiUrl: propApiUrl,
  theme: propTheme,
  position = 'right',
  wantToShowSuggestions = false,
  borderRadius: propBorderRadius,
  toggleBtnRadius,
  fontFamily,
  primaryColor: propPrimaryColor,
  textColor: propTextColor,
  chatbotAvatar: propChatbotAvatar,
  welcomeMessage: propWelcomeMessage,
  botName: propBotName,
}) => {
  // Auto-read token from props, or environment variable, or window global
  const activeToken =
    propToken ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APTUS_TOKEN) ||
    (typeof window !== 'undefined' && (window as any).APTUS_CHATBOT_TOKEN) ||
    '';

  const [show, setShow] = useState(false);
  
  // Initialize chatbotDetails from localStorage cache to completely eliminate flash of default theme (FOUT)
  const [chatbotDetails, setChatbotDetails] = useState<ChatbotDetails | null>(() => {
    try {
      if (typeof window !== "undefined" && activeToken) {
        const cached = localStorage.getItem(`aptus_config_${activeToken}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }
    } catch (e) {}
    return null;
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cached avatar from localStorage to eliminate avatar flicker
  const [cachedAvatar, setCachedAvatar] = useState<string>(() => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem("aptus_saved_avatar") || "chat";
      }
    } catch (e) {}
    return "chat";
  });

  const activeApiUrl =
    propApiUrl ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APTUS_API_URL) ||
    'http://localhost:3100/api/v1';

  // Effective appearance settings: prop overrides -> server details -> defaults
  const effectiveTheme = propTheme || chatbotDetails?.theme || 'aptus';
  const effectivePrimaryColor = propPrimaryColor || chatbotDetails?.primaryColor;
  const effectiveTextColor = propTextColor || chatbotDetails?.textColor;
  const effectiveBorderRadius = propBorderRadius || (chatbotDetails?.borderRadius && chatbotDetails.borderRadius !== 'default' ? chatbotDetails.borderRadius : undefined);
  const effectiveBotName = propBotName || chatbotDetails?.botName || chatbotDetails?.bussinessName || 'Aptus AI';
  const effectiveWelcomeMessage = propWelcomeMessage || chatbotDetails?.welcomeMessage;
  const effectiveAvatar = propChatbotAvatar || chatbotDetails?.chatbotAvatar || cachedAvatar || 'chat';

  const themeConfig = getThemeConfig(effectiveTheme, effectiveBorderRadius, toggleBtnRadius, fontFamily);

  // If primaryColor is customized
  if (effectivePrimaryColor && effectivePrimaryColor !== 'default') {
    themeConfig.headerBg = effectivePrimaryColor;
    themeConfig.toggleBg = effectivePrimaryColor;
    themeConfig.buttonBg = effectivePrimaryColor;
    themeConfig.userBubbleBg = effectivePrimaryColor;
  }

  // Ensure toggle and bubble colors always have readable contrast
  themeConfig.toggleColor = getContrastColor(themeConfig.toggleBg);
  themeConfig.userBubbleColor = getContrastColor(themeConfig.userBubbleBg);

  // If textColor is customized
  if (effectiveTextColor) {
    themeConfig.headerColor = effectiveTextColor;
    themeConfig.userBubbleColor = effectiveTextColor;
    themeConfig.buttonColor = effectiveTextColor;
    themeConfig.toggleColor = effectiveTextColor;
  } else {
    themeConfig.headerColor = getContrastColor(themeConfig.headerBg);
  }

  useEffect(() => {
    const fetchChatbotDetails = async () => {
      try {
        setErrorMessage(null);
        if (!activeToken) {
          setErrorMessage("Chatbot token not provided. Please set NEXT_PUBLIC_APTUS_TOKEN or pass token prop.");
          return;
        }
        const details = await getChatbotDetails(activeToken, activeApiUrl);
        if (details) {
          setChatbotDetails(details);
          try {
            localStorage.setItem(`aptus_config_${activeToken}`, JSON.stringify(details));
          } catch (e) {}
          if (details.chatbotAvatar) {
            setCachedAvatar(details.chatbotAvatar);
            try {
              localStorage.setItem("aptus_saved_avatar", details.chatbotAvatar);
            } catch (e) {}
          }
        } else {
          setErrorMessage("Failed to load chatbot details");
        }
      } catch (error: any) {
        console.error("Error fetching chatbot details:", error);
        setErrorMessage(error?.response?.data?.message || error?.message || "Invalid token or network error");
      }
    };

    if (activeApiUrl && activeToken) {
      fetchChatbotDetails();
    }
  }, [activeToken, activeApiUrl]);

  // Config is ready if developer passed explicit props OR if details are available (from cache or server)
  const isConfigReady = Boolean(propTheme || propPrimaryColor || chatbotDetails);

  return (
    <AppContainer $fontFamily={themeConfig.fontFamily}>
      {!show && (
        <ChatbotToggleButton
          $position={position}
          $config={themeConfig}
          $animate={animate}
          style={{
            backgroundColor: toggleBtnBgColor || themeConfig.toggleBg,
            color: toggleBtncolor || themeConfig.toggleColor,
            opacity: isConfigReady ? 1 : 0,
            pointerEvents: isConfigReady ? 'auto' : 'none',
            transition: 'opacity 0.2s ease-in, transform 0.15s ease-in-out',
          }}
          onClick={() => setShow(true)}
        >
          {icon ? (
            icon
          ) : (
            renderAvatarIcon(effectiveAvatar, 28, toggleBtncolor || themeConfig.toggleColor)
          )}
        </ChatbotToggleButton>
      )}

      <ChatbotWrapper $show={show} $position={position} $config={themeConfig}>
        {chatbotDetails ? (
          <Chatbot
            chatbotDetails={chatbotDetails}
            theme={effectiveTheme}
            position={position}
            wantToShowSuggestions={wantToShowSuggestions}
            apiUrl={activeApiUrl}
            token={activeToken}
            borderRadius={effectiveBorderRadius}
            toggleBtnRadius={toggleBtnRadius}
            fontFamily={fontFamily}
            primaryColor={effectivePrimaryColor}
            textColor={effectiveTextColor}
            chatbotAvatar={effectiveAvatar}
            welcomeMessage={effectiveWelcomeMessage}
            botName={effectiveBotName}
            onClose={() => setShow(false)}
          />
        ) : errorMessage ? (
          <ErrorContainer $config={themeConfig}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <AiOutlineWarning size={20} /> {errorMessage}
            </span>
          </ErrorContainer>
        ) : (
          <Loader $config={themeConfig} />
        )}
      </ChatbotWrapper>
    </AppContainer>
  );
};

export default App;
