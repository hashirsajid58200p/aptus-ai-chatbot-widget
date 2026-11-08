import React, { useState, useEffect, useRef, ReactNode } from "react";
import generateSession from "../utils/generateSession";
import axios from "axios";
import styled from "styled-components";
import { IoSend, IoMic, IoMicOff } from "react-icons/io5";
import { TbUser, TbMessageCircleOff, TbMessageChatbot } from "react-icons/tb";
import { RiRobot2Line, RiCustomerService2Line, RiShieldCheckLine, RiSecurePaymentLine, RiSparklingFill, RiCpuLine, RiMagicLine } from "react-icons/ri";
import { FaStar, FaBolt, FaLock, FaBrain } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import generateSugesstions from "../utils/generateSuggestions";
import { getThemeConfig, ThemeConfig } from "../theme";
import { getContrastColor } from "../App";

interface Message {
  role: "user" | "bot";
  message: string;
  isError?: boolean;
  promoType?: "showcase" | "trust" | "payment" | null;
  sender?: "user" | "ai" | "human_agent";
}

interface SessionInterface {
  started: boolean;
  email: string;
  username: string;
  phone?: string;
  sessionId?: string;
}

interface ChatbotProps {
  chatbotDetails: {
    id: string;
    bussinessName: string;
    bussinessCategory: string;
    bussinessDescription: string;
    bussinessDetails: {
      question: string;
      answer: string;
    }[];
  };
  theme?: string;
  position?: "left" | "right";
  wantToShowSuggestions?: boolean;
  apiUrl: string;
  token: string;
  borderRadius?: string | number;
  toggleBtnRadius?: string | number;
  fontFamily?: string;
  primaryColor?: string;
  textColor?: string;
  chatbotAvatar?: string | ReactNode;
  welcomeMessage?: string;
  botName?: string;
  onClose?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({
  chatbotDetails,
  theme = "aptus",
  wantToShowSuggestions = false,
  apiUrl,
  token,
  borderRadius,
  toggleBtnRadius,
  fontFamily,
  primaryColor,
  textColor,
  chatbotAvatar,
  welcomeMessage,
  botName,
  onClose,
}) => {
  const [session, setSession] = useState<SessionInterface>({
    started: false,
    email: "",
    username: "",
    phone: "",
    sessionId: "",
  });

  const defaultWelcome = welcomeMessage || `Hello! Welcome to ${chatbotDetails?.bussinessName || "Aptus AI"}. How can I assist you today?`;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      message: defaultWelcome,
      sender: "ai",
    },
  ]);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Voice States (Groq Whisper)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Live Agent States
  const [isHumanActive, setIsHumanActive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const themeConfig = getThemeConfig(theme, borderRadius, toggleBtnRadius, fontFamily);
  if (primaryColor && primaryColor !== 'default') {
    themeConfig.headerBg = primaryColor;
    themeConfig.toggleBg = primaryColor;
    themeConfig.buttonBg = primaryColor;
    themeConfig.userBubbleBg = primaryColor;
  }
  if (textColor) {
    themeConfig.headerColor = textColor;
  } else if (primaryColor && primaryColor !== 'default') {
    themeConfig.headerColor = getContrastColor(primaryColor);
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Auto-initialize session on mount (Zero-Config, no blocking pre-chat form)
  useEffect(() => {
    const initAutoSession = async () => {
      if (!session.started && token && apiUrl) {
        try {
          const response = await generateSession({
            email: "visitor@web.local",
            username: "Website Visitor",
            phone: "",
            token,
            apiUrl,
          });

          if (response?.session?._id) {
            setSession({
              started: true,
              email: "visitor@web.local",
              username: "Website Visitor",
              phone: "",
              sessionId: response.session._id,
            });
          }
        } catch (err) {
          console.warn("Session auto-init warning:", err);
        }
      }
    };

    initAutoSession();
  }, [token, apiUrl, session.started]);

  // Voice Input via Groq Whisper (State-of-the-art multi-language accuracy)
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording with optimized audio constraints for crystal clear voice capture
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        let mimeType = "audio/webm";
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }

        const mediaRecorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          if (audioBlob.size < 200) {
            setIsRecording(false);
            return;
          }

          setIsTranscribing(true);
          try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result as string;
              const res = await axios.post(`${apiUrl}/chatbot/transcribe`, {
                audio: base64Audio,
                mimeType: mimeType,
              });

              if (res.data?.success && res.data.text) {
                const text = res.data.text.trim();
                setInput((prev) => (prev ? `${prev} ${text}` : text));
              }
              setIsTranscribing(false);
            };
          } catch (err: any) {
            console.error("Transcription error:", err);
            setIsTranscribing(false);
          }
        };

        // Collect audio in 250ms chunks to ensure complete speech capture
        mediaRecorder.start(250);
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Please allow microphone access to use voice typing.");
      }
    }
  };

  const typewriterEffect = async (text: string) => {
    let currentText = "";
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "bot", message: "", sender: isHumanActive ? "human_agent" : "ai" },
    ]);

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1].message = currentText;
        return updatedMessages;
      });
      scrollToBottom();
      await new Promise((resolve) => setTimeout(resolve, 8));
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() !== "" && !loading) {
      const userMessage = input.trim();
      setInput("");
      setShowSuggestions(false);

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", message: userMessage, sender: "user" },
      ]);
      setLoading(true);
      scrollToBottom();

      try {
        let activeSessionId = session.sessionId;
        if (!activeSessionId) {
          const sessRes = await generateSession({
            email: "visitor@web.local",
            username: "Website Visitor",
            phone: "",
            token,
            apiUrl,
          });
          activeSessionId = sessRes.session._id;
          setSession({
            started: true,
            email: "visitor@web.local",
            username: "Website Visitor",
            phone: "",
            sessionId: activeSessionId,
          });
        }

        const response = await axios.post(
          `${apiUrl}/chatbot/getResponse`,
          {
            message: userMessage,
            session_id: activeSessionId,
          },
          {
            headers: {
              "x-chatbot-token": token,
            },
          }
        );

        const content = response.data.data;

        // Parse Promo Tags
        let promoType: "showcase" | "trust" | "payment" | null = null;
        let cleanText = content;
        if (cleanText.includes("[PROMO:showcase]")) {
          promoType = "showcase";
          cleanText = cleanText.replace(/\[PROMO:showcase\]/g, "").trim();
        } else if (cleanText.includes("[PROMO:trust]")) {
          promoType = "trust";
          cleanText = cleanText.replace(/\[PROMO:trust\]/g, "").trim();
        } else if (cleanText.includes("[PROMO:payment]")) {
          promoType = "payment";
          cleanText = cleanText.replace(/\[PROMO:payment\]/g, "").trim();
        }

        await typewriterEffect(cleanText);

        // Attach promo badge if triggered
        if (promoType) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1].promoType = promoType;
            return copy;
          });
        }

        if (
          wantToShowSuggestions &&
          (content.toLowerCase().includes("sorry") ||
            content.toLowerCase().includes("apologize") ||
            content.toLowerCase().includes("error"))
        ) {
          setShowSuggestions(true);
        }
      } catch (error: any) {
        console.error("Error fetching response:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "bot", message: error?.response?.data?.message || "Sorry, something went wrong. Please try again.", isError: true, sender: "ai" },
        ]);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    }
  };

  // Request Live Agent
  const handleRequestHuman = () => {
    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        message: "Live agent handoff is monitored by our support desk. If all human agents are currently offline, our AI assistant is actively handling questions 24/7!",
        sender: "ai",
      },
    ]);
    scrollToBottom();
  };

  useEffect(() => {
    const getSuggestionsList = async () => {
      if (wantToShowSuggestions && showSuggestions) {
        const suggestionsList = await generateSugesstions(chatbotDetails?.bussinessDetails || [], apiUrl, token);
        setSuggestions(suggestionsList || []);
      }
    };
    getSuggestionsList();
  }, [showSuggestions, wantToShowSuggestions, chatbotDetails, apiUrl, token]);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const headerTitle = botName || chatbotDetails?.bussinessName || "Aptus AI Assistant";

  const renderAvatar = (size = 16, color?: string) => {
    if (!chatbotAvatar || chatbotAvatar === "bot") {
      return <RiRobot2Line size={size} color={color} />;
    }
    if (chatbotAvatar === "sparkles") return <RiSparklingFill size={size} color={color} />;
    if (chatbotAvatar === "chat") return <TbMessageChatbot size={size} color={color} />;
    if (chatbotAvatar === "agent") return <RiCustomerService2Line size={size} color={color} />;
    if (chatbotAvatar === "brain") return <FaBrain size={size} color={color} />;
    if (chatbotAvatar === "cpu") return <RiCpuLine size={size} color={color} />;
    if (chatbotAvatar === "zap") return <FaBolt size={size} color={color} />;
    if (chatbotAvatar === "wand") return <RiMagicLine size={size} color={color} />;
    if (typeof chatbotAvatar === "string" && (chatbotAvatar.startsWith("http") || chatbotAvatar.startsWith("data:"))) {
      return (
        <img
          src={chatbotAvatar}
          alt="Avatar"
          style={{ width: `${size}px`, height: `${size}px`, borderRadius: "50%", objectFit: "cover" }}
        />
      );
    }
    return <RiRobot2Line size={size} color={color} />;
  };

  return (
    <ChatbotContainer $config={themeConfig}>
      {/* Header */}
      <Header $config={themeConfig}>
        <HeaderLeft>
          <AvatarCircle $bg="rgba(255, 255, 255, 0.2)" $color={themeConfig.headerColor}>
            {renderAvatar(16, themeConfig.headerColor)}
          </AvatarCircle>
          <HeaderTitleText style={{ color: themeConfig.headerColor }}>
            <span style={{ color: themeConfig.headerColor, fontWeight: 800 }}>{headerTitle}</span>
            <OnlineStatusBadge style={{ color: themeConfig.headerColor, opacity: 0.85 }}>● Online</OnlineStatusBadge>
          </HeaderTitleText>
        </HeaderLeft>

        <HeaderControls>
          <HeaderIconButton
            title="Request Live Human Agent"
            onClick={handleRequestHuman}
            style={{ color: themeConfig.headerColor, borderColor: "rgba(255,255,255,0.3)" }}
          >
            <RiCustomerService2Line size={18} />
          </HeaderIconButton>
          {onClose && (
            <HeaderIconButton
              title="Close Chat"
              onClick={onClose}
              style={{ color: themeConfig.headerColor, borderColor: "rgba(255,255,255,0.3)" }}
            >
              <AiOutlineClose size={16} />
            </HeaderIconButton>
          )}
        </HeaderControls>
      </Header>

      {/* Messages Feed */}
      <MessagesContainer ref={messagesContainerRef} $config={themeConfig}>
        {messages.map((message, index) =>
          message.role === "bot" ? (
            <BotMessageWrapper key={index} $config={themeConfig}>
              <AvatarCircle $bg="rgba(0, 0, 0, 0.08)" $color={themeConfig.botBubbleColor || "#1a1a1a"}>
                {message.isError ? (
                  <TbMessageCircleOff size={16} />
                ) : message.sender === "human_agent" ? (
                  <RiCustomerService2Line size={16} />
                ) : (
                  renderAvatar(16, themeConfig.botBubbleColor || "#1a1a1a")
                )}
              </AvatarCircle>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "100%" }}>
                {message.sender === "human_agent" && (
                  <SenderBadge>Live Support Agent</SenderBadge>
                )}
                <MessageBubble $config={themeConfig} role="bot">
                  {message.message}
                </MessageBubble>

                {/* Promotional In-Chat Cards */}
                {message.promoType === "showcase" && (
                  <PromoCard $config={themeConfig}>
                    <PromoTitle><RiSparklingFill color="#eab308" /> Feature Showcase</PromoTitle>
                    <PromoGrid>
                      <PromoItem><FaBolt color="#3b82f6" /> Instant AI Answers</PromoItem>
                      <PromoItem><FaLock color="#10b981" /> 24/7 Automation</PromoItem>
                      <PromoItem><FaStar color="#f59e0b" /> High Accuracy</PromoItem>
                    </PromoGrid>
                  </PromoCard>
                )}

                {message.promoType === "trust" && (
                  <PromoCard $config={themeConfig}>
                    <PromoTitle><RiShieldCheckLine color="#10b981" /> Enterprise Trust & Security</PromoTitle>
                    <PromoGrid>
                      <PromoItem>🛡️ 256-Bit SSL Encrypted</PromoItem>
                      <PromoItem>⭐ Rated 4.9/5 by Clients</PromoItem>
                      <PromoItem>👥 Zero-Config Widget</PromoItem>
                    </PromoGrid>
                  </PromoCard>
                )}

                {message.promoType === "payment" && (
                  <PromoCard $config={themeConfig}>
                    <PromoTitle><RiSecurePaymentLine color="#6366f1" /> Verified Payment Methods</PromoTitle>
                    <PromoGrid>
                      <PromoItem>💳 Visa & Mastercard</PromoItem>
                      <PromoItem>💎 PayPal Checkout</PromoItem>
                      <PromoItem>🔒 Stripe Protected</PromoItem>
                    </PromoGrid>
                  </PromoCard>
                )}
              </div>
            </BotMessageWrapper>
          ) : (
            <UserMessageWrapper key={index} $config={themeConfig}>
              <MessageBubble $config={themeConfig} role="user">
                {message.message}
              </MessageBubble>
              <AvatarCircle
                $bg={themeConfig.userBubbleBg || "#007bff"}
                $color={themeConfig.userBubbleColor || "#ffffff"}
              >
                <TbUser size={16} />
              </AvatarCircle>
            </UserMessageWrapper>
          )
        )}

        {showSuggestions && (
          <SuggestionsContainer>
            {suggestions.map((sugg, i) => (
              <Suggestion key={i} $config={themeConfig} onClick={() => handleSuggestionClick(sugg)}>
                {sugg}
              </Suggestion>
            ))}
          </SuggestionsContainer>
        )}

        {loading && (
          <BotMessageWrapper $config={themeConfig}>
            <AvatarCircle $bg="rgba(0, 0, 0, 0.08)" $color={themeConfig.botBubbleColor || "#1a1a1a"}>
              {renderAvatar(16, themeConfig.botBubbleColor || "#1a1a1a")}
            </AvatarCircle>
            <MessageBubble $config={themeConfig} role="bot">
              Typing...
            </MessageBubble>
          </BotMessageWrapper>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Input Bar with Groq Whisper Voice Input */}
      <ChatInputContainer $config={themeConfig}>
        <VoiceButton
          title={isRecording ? "Recording voice... Click to convert" : isTranscribing ? "Transcribing voice with Whisper..." : "Voice Input (Whisper STT)"}
          onClick={toggleRecording}
          $isListening={isRecording}
          type="button"
          disabled={isTranscribing}
        >
          {isRecording ? <IoMicOff size={18} color="#ef4444" /> : <IoMic size={18} />}
        </VoiceButton>

        <ChatInput
          $config={themeConfig}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          placeholder={isRecording ? "Listening to your voice..." : isTranscribing ? "Transcribing speech..." : "Type a message..."}
        />
        <SendButton $config={themeConfig} onClick={handleSendMessage} disabled={loading}>
          <IoSend size={18} />
        </SendButton>
      </ChatInputContainer>
    </ChatbotContainer>
  );
};

export default Chatbot;

// --- Styled Components ---

const ChatbotContainer = styled.div<{ $config: ThemeConfig }>`
  @keyframes aptusSlideUp {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes aptusPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.12); box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }
    100% { transform: scale(1); }
  }

  width: 100%;
  height: 100%;
  background-color: ${({ $config }) => $config.containerBg};
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  font-family: ${({ $config }) => $config.fontFamily};
`;

const Header = styled.div<{ $config: ThemeConfig }>`
  background-color: ${({ $config }) => $config.headerBg};
  color: ${({ $config }) => $config.headerColor};
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: ${({ $config }) => $config.headerBorderBottom || "none"};
  z-index: 10;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderIconButton = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => ($active ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.15)")};
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: inherit;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }
`;

const HeaderTitleText = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 800;
  font-size: 14px;
  line-height: 1.2;
`;

const OnlineStatusBadge = styled.span`
  font-size: 10px;
  color: #bbf7d0;
  font-weight: 600;
`;

const SenderBadge = styled.span`
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #ea580c;
  letter-spacing: 0.05em;
`;

const MessagesContainer = styled.div<{ $config: ThemeConfig }>`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: ${({ $config }) => $config.containerBg};
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  animation: aptusSlideUp 0.2s ease-out;
`;

const BotMessageWrapper = styled(MessageWrapper)<{ $config: ThemeConfig }>`
  justify-content: flex-start;
  align-self: flex-start;
  max-width: 88%;
`;

const UserMessageWrapper = styled(MessageWrapper)<{ $config: ThemeConfig }>`
  justify-content: flex-end;
  align-self: flex-end;
  max-width: 88%;
`;

const AvatarCircle = styled.div<{ $bg?: string; $color?: string }>`
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background-color: ${({ $bg }) => $bg || "rgba(0, 0, 0, 0.1)"};
  color: ${({ $color }) => $color || "inherit"};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const MessageBubble = styled.div<{ $config: ThemeConfig; role: "user" | "bot" }>`
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1.5;
  box-sizing: border-box;
  word-break: break-word;
  white-space: pre-wrap;

  ${({ role, $config }) =>
    role === "user"
      ? `
    background-color: ${$config.userBubbleBg};
    color: ${$config.userBubbleColor};
    border-radius: ${$config.userBubbleRadius};
    border: ${$config.userBubbleBorder};
    box-shadow: ${$config.userBubbleShadow};
  `
      : `
    background-color: ${$config.botBubbleBg};
    color: ${$config.botBubbleColor};
    border-radius: ${$config.botBubbleRadius};
    border: ${$config.botBubbleBorder};
    box-shadow: ${$config.botBubbleShadow};
  `}
`;

// Promo Cards
const PromoCard = styled.div<{ $config: ThemeConfig }>`
  background: white;
  border: ${({ $config }) => $config.botBubbleBorder || "2px solid #1a1a1a"};
  box-shadow: ${({ $config }) => $config.botBubbleShadow || "2px 2px 0px #1a1a1a"};
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 4px;
  animation: aptusSlideUp 0.3s ease-out;
`;

const PromoTitle = styled.div`
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
`;

const PromoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
`;

const PromoItem = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SuggestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
`;

const Suggestion = styled.button<{ $config: ThemeConfig }>`
  background-color: white;
  border: ${({ $config }) => $config.buttonBorder || "1px solid #1a1a1a"};
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;

  &:hover {
    background-color: #f3f4f6;
    transform: translateX(2px);
  }
`;

const ChatInputContainer = styled.div<{ $config: ThemeConfig }>`
  padding: 10px 12px;
  background-color: ${({ $config }) => $config.inputAreaBg || "white"};
  border-top: ${({ $config }) => $config.inputAreaBorderTop || "1px solid #e5e7eb"};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VoiceButton = styled.button<{ $isListening: boolean }>`
  background: ${({ $isListening }) => ($isListening ? "#fee2e2" : "#f3f4f6")};
  border: 1px solid ${({ $isListening }) => ($isListening ? "#ef4444" : "#d1d5db")};
  color: ${({ $isListening }) => ($isListening ? "#ef4444" : "#4b5563")};
  border-radius: 8px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  animation: ${({ $isListening }) => ($isListening ? "aptusPulse 1.2s infinite ease-in-out" : "none")};

  &:hover {
    background: ${({ $isListening }) => ($isListening ? "#fecaca" : "#e5e7eb")};
  }
`;

const ChatInput = styled.input<{ $config: ThemeConfig }>`
  flex: 1;
  padding: 10px 14px;
  font-size: 13px;
  background-color: ${({ $config }) => $config.inputBg || "#f9fafb"};
  color: ${({ $config }) => $config.inputColor || "#111827"};
  border: ${({ $config }) => $config.inputBorder || "1px solid #d1d5db"};
  border-radius: ${({ $config }) => $config.inputRadius || "8px"};
  outline: none;

  &:focus {
    border-color: ${({ $config }) => $config.headerBg};
  }
`;

const SendButton = styled.button<{ $config: ThemeConfig }>`
  background-color: ${({ $config }) => $config.buttonBg};
  color: ${({ $config }) => $config.buttonColor};
  border: ${({ $config }) => $config.buttonBorder || "none"};
  border-radius: ${({ $config }) => $config.buttonRadius || "8px"};
  box-shadow: ${({ $config }) => $config.buttonShadow || "none"};
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
