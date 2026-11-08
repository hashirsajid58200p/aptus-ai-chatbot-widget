import React, { ReactNode, useEffect, useState } from 'react';
import { AiOutlineClose, AiOutlineWarning } from 'react-icons/ai';
import { TbMessageChatbot } from 'react-icons/tb';
import styled, { keyframes } from 'styled-components';
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
  botName?: string;
  welcomeMessage?: string;
  chatbotAvatar?: string;
  allowedDomains?: string[];
}

// Keyframe animations
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// App container
const AppContainer = styled.div<{ $fontFamily: string }>`
  font-family: ${({ $fontFamily }) => $fontFamily};
`;

// Chatbot Toggle Button
const ChatbotToggleButton = styled.div<{ $position: string; $config: ThemeConfig; $animate: boolean }>`
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
  animation: ${(props) => (props.$animate ? bounce : 'none')} 1.2s infinite;
  z-index: 999999;

  &:hover {
    transform: scale(1.08);
  }
`;

// Chatbot Wrapper
const ChatbotWrapper = styled.div<{ $show: boolean; $position: string; $config: ThemeConfig }>`
  position: fixed;
  bottom: 90px;
  ${({ $position }) => ($position === 'left' ? 'left: 20px;' : 'right: 20px;')}
  width: 400px;
  height: 600px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 120px);
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
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: ${({ $config }) => $config.headerBg};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
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
  borderRadius,
  toggleBtnRadius,
  fontFamily,
  primaryColor: propPrimaryColor,
  chatbotAvatar: propChatbotAvatar,
  welcomeMessage: propWelcomeMessage,
  botName: propBotName,
}) => {
  const [show, setShow] = useState(false);
  const [chatbotDetails, setChatbotDetails] = useState<ChatbotDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-read token from props, or environment variable, or window global
  const activeToken =
    propToken ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APTUS_TOKEN) ||
    (typeof window !== 'undefined' && (window as any).APTUS_CHATBOT_TOKEN) ||
    '';

  const activeApiUrl =
    propApiUrl ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APTUS_API_URL) ||
    'http://localhost:3100/api/v1';

  // Effective appearance settings: prop overrides -> server details -> defaults
  const effectiveTheme = propTheme || chatbotDetails?.theme || 'aptus';
  const effectivePrimaryColor = propPrimaryColor || chatbotDetails?.primaryColor;
  const effectiveBotName = propBotName || chatbotDetails?.botName || chatbotDetails?.bussinessName || 'Aptus AI';
  const effectiveWelcomeMessage = propWelcomeMessage || chatbotDetails?.welcomeMessage;
  const effectiveAvatar = propChatbotAvatar || chatbotDetails?.chatbotAvatar;

  const themeConfig = getThemeConfig(effectiveTheme, borderRadius, toggleBtnRadius, fontFamily);
  if (propPrimaryColor) {
    themeConfig.headerBg = propPrimaryColor;
    themeConfig.toggleBg = propPrimaryColor;
    themeConfig.buttonBg = propPrimaryColor;
    themeConfig.userBubbleBg = propPrimaryColor;
  } else if (chatbotDetails?.primaryColor && chatbotDetails?.primaryColor !== '#f97316') {
    themeConfig.headerBg = chatbotDetails.primaryColor;
    themeConfig.toggleBg = chatbotDetails.primaryColor;
    themeConfig.buttonBg = chatbotDetails.primaryColor;
    themeConfig.userBubbleBg = chatbotDetails.primaryColor;
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
        } else {
          setErrorMessage("Failed to load chatbot details");
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error fetching chatbot details:", error);
        setErrorMessage(error?.response?.data?.message || error?.message || "Invalid token or network error");
      }
    };

    if (activeApiUrl && activeToken) {
      fetchChatbotDetails();
    }
  }, [activeToken, activeApiUrl]);

  return (
    <AppContainer $fontFamily={themeConfig.fontFamily}>
      <ChatbotToggleButton
        $position={position}
        $config={themeConfig}
        $animate={!show && animate}
        style={{
          backgroundColor: toggleBtnBgColor || undefined,
          color: toggleBtncolor || undefined,
        }}
        onClick={() => setShow(!show)}
      >
        {show ? <AiOutlineClose size={32} /> : icon || <TbMessageChatbot size={32} />}
      </ChatbotToggleButton>

      <ChatbotWrapper $show={show} $position={position} $config={themeConfig}>
        {chatbotDetails ? (
          <Chatbot
            chatbotDetails={chatbotDetails}
            theme={effectiveTheme}
            position={position}
            wantToShowSuggestions={wantToShowSuggestions}
            apiUrl={activeApiUrl}
            token={activeToken}
            borderRadius={borderRadius}
            toggleBtnRadius={toggleBtnRadius}
            fontFamily={fontFamily}
            primaryColor={effectivePrimaryColor}
            chatbotAvatar={effectiveAvatar}
            welcomeMessage={effectiveWelcomeMessage}
            botName={effectiveBotName}
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
