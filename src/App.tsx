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

interface AppProps {
  icon?: ReactNode;
  toggleBtnBgColor?: string;
  toggleBtncolor?: string;
  animate?: boolean;
  token: string;
  apiUrl: string;
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

interface ChatbotDetails {
  id: string;
  bussinessName: string;
  bussinessCategory: string;
  bussinessDescription: string;
  bussinessDetails: {
    question: string;
    answer: string;
  }[];
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
  z-index: 99999;
  
  &:hover {
    transform: scale(1.05) translateY(-2px);
  }
  &:active {
    transform: scale(0.95);
  }
`;

// Chatbot Outer Wrapper
const ChatbotWrapper = styled.div<{ $show: boolean; $position: string; $config: ThemeConfig }>`
  position: fixed;
  ${({ $position }) => ($position === 'left' ? 'left: 20px;' : 'right: 20px;')}
  bottom: 96px;
  width: 360px;
  height: 520px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 110px);
  background-color: ${({ $config }) => $config.containerBg};
  border-radius: ${({ $config }) => $config.wrapperRadius};
  border: ${({ $config }) => $config.wrapperBorder || 'none'};
  box-shadow: ${({ $config }) => $config.wrapperShadow || '0 12px 30px rgba(0, 0, 0, 0.2)'};
  transition: opacity 0.25s ease-out, transform 0.25s ease-out;
  ${({ $show }) => ($show ? 'opacity: 1; transform: translateY(-5px); pointer-events: auto;' : 'opacity: 0; transform: translateY(15px); pointer-events: none;')}
  z-index: 99998;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 340px;
    height: 500px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 100px);
    bottom: 90px;
  }
`;

// Loader Component
const Loader = styled.div<{ $config: ThemeConfig }>`
  border: 4px solid ${({ $config }) => $config.inputBorder || '#e0e0e0'};
  border-top: 4px solid ${({ $config }) => $config.headerBg};
  border-radius: 50%;
  width: 45px;
  height: 45px;
  animation: ${spin} 0.9s linear infinite;
  margin: 200px auto;
`;

const ErrorContainer = styled.div<{ $config: ThemeConfig }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  color: #d32f2f;
  font-weight: 600;
  font-size: 0.9em;
  line-height: 1.5;
`;

const App: React.FC<AppProps> = ({
  icon,
  toggleBtnBgColor = '',
  toggleBtncolor = '',
  animate = true,
  token,
  apiUrl,
  theme = 'aptus',
  position = 'right',
  wantToShowSuggestions = false,
  borderRadius,
  toggleBtnRadius,
  fontFamily,
  primaryColor,
  chatbotAvatar,
  welcomeMessage,
  botName,
}) => {
  const [show, setShow] = useState(false);
  const [chatbotDetails, setChatbotDetails] = useState<ChatbotDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const themeConfig = getThemeConfig(theme, borderRadius, toggleBtnRadius, fontFamily);
  if (primaryColor) {
    themeConfig.headerBg = primaryColor;
    themeConfig.toggleBg = primaryColor;
    themeConfig.buttonBg = primaryColor;
    themeConfig.userBubbleBg = primaryColor;
  }

  useEffect(() => {
    const fetchChatbotDetails = async () => {
      try {
        setErrorMessage(null);
        const details = await getChatbotDetails(token, apiUrl);
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

    if (apiUrl && token) {
      fetchChatbotDetails();
    }
  }, [token, apiUrl]);

  if (!token) {
    console.error('Valid Token is required for Aptus Chatbot');
    throw new Error('Valid Token is required for Aptus Chatbot');
  }

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
            theme={theme}
            position={position}
            wantToShowSuggestions={wantToShowSuggestions}
            apiUrl={apiUrl}
            token={token}
            borderRadius={borderRadius}
            toggleBtnRadius={toggleBtnRadius}
            fontFamily={fontFamily}
            primaryColor={primaryColor}
            chatbotAvatar={chatbotAvatar}
            welcomeMessage={welcomeMessage}
            botName={botName}
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
