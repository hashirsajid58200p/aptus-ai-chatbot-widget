import React, { useState, useEffect, useRef, ReactNode } from "react";
import generateSession from "../utils/generateSession";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import { IoSend, IoMic, IoMicOff, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { TbMessages, TbUser, TbMessageCircleOff, TbPhone, TbMail } from "react-icons/tb";
import { RiRobot2Line, RiCustomerService2Line, RiShieldCheckLine, RiSecurePaymentLine, RiSparklingFill } from "react-icons/ri";
import { FaStar, FaBolt, FaLock } from "react-icons/fa";
import generateSugesstions from "../utils/generateSuggestions";
import { getThemeConfig, ThemeConfig } from "../theme";

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
  chatbotAvatar?: string | ReactNode;
  welcomeMessage?: string;
  botName?: string;
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
  chatbotAvatar,
  welcomeMessage,
  botName,
}) => {
  const [session, setSession] = useState<SessionInterface>({
    started: false,
    email: "",
    username: "",
    phone: "",
    sessionId: "",
  });

  const defaultWelcome = welcomeMessage || `Hello! Welcome to ${chatbotDetails?.bussinessName || "Aptus AI Support"}. How can I help you today?`;

  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", message: defaultWelcome, sender: "ai" },
  ]);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Live Agent / Offline Mode States
  const [isHumanActive, setIsHumanActive] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState("");
  const [offlineSubmitted, setOfflineSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const themeConfig = getThemeConfig(theme, borderRadius, toggleBtnRadius, fontFamily);
  if (primaryColor) {
    themeConfig.headerBg = primaryColor;
    themeConfig.toggleBg = primaryColor;
    themeConfig.buttonBg = primaryColor;
    themeConfig.userBubbleBg = primaryColor;
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = "en-US";

        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recog.onerror = (err: any) => {
          console.error("Speech recognition error:", err);
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start recognition:", e);
      }
    }
  };

  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Remove promo tags before speaking
      const cleanText = text.replace(/\[PROMO:[a-zA-Z0-9_-]+\]/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  let bussinessDetails = "Bussiness Details :";
  bussinessDetails += "Bussiness Name : " + chatbotDetails.bussinessName + ",";
  bussinessDetails += "Bussiness Category : " + chatbotDetails.bussinessCategory + ",";
  bussinessDetails += "Bussiness Description : " + chatbotDetails.bussinessDescription + ",";
  bussinessDetails += "Questionaries :";
  (chatbotDetails.bussinessDetails || []).forEach((item) => {
    bussinessDetails += item.question + " : " + item.answer + ",";
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Parse Promotional Tags from Bot Response
  const parsePromoTag = (text: string): { cleanText: string; promoType: "showcase" | "trust" | "payment" | null } => {
    if (text.includes("[PROMO:showcase]")) {
      return { cleanText: text.replace("[PROMO:showcase]", "").trim(), promoType: "showcase" };
    }
    if (text.includes("[PROMO:trust]")) {
      return { cleanText: text.replace("[PROMO:trust]", "").trim(), promoType: "trust" };
    }
    if (text.includes("[PROMO:payment]")) {
      return { cleanText: text.replace("[PROMO:payment]", "").trim(), promoType: "payment" };
    }
    return { cleanText: text, promoType: null };
  };

  const handleSendMessage = async () => {
    setShowSuggestions(false);
    if (input.trim() !== "" && !loading) {
      const updatedMessages: Message[] = [
        ...messages,
        { role: "user", message: input, sender: "user" },
      ];
      setMessages(updatedMessages);
      const temp = input;
      setInput("");
      setLoading(true);

      try {
        const backendHistory = [];
        for (let i = 1; i < updatedMessages.length - 1; i += 2) {
          const userMsg = updatedMessages[i];
          const botMsg = updatedMessages[i + 1];
          if (userMsg && botMsg) {
            backendHistory.push({
              question: userMsg.message,
              answer: botMsg.message,
            });
          }
        }

        const res = await axios.post(`${apiUrl}/chatbot/getResponse`, {
          messages: backendHistory,
          message: temp,
          session_id: session.sessionId,
          token: token,
        });

        if (!res.data.success) {
          throw new Error("Failed to get response from AI");
        }

        const rawData = res.data.data;
        const { cleanText, promoType } = parsePromoTag(rawData);

        const botMessageIndex = updatedMessages.length;
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "bot", message: "Typing...", sender: res.data.isHumanMode ? "human_agent" : "ai" },
        ]);

        let content = "";
        const typewriterEffect = async (text: string) => {
          for (let i = 0; i < text.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 8));
            content += text.charAt(i);
            setMessages((prevMessages) => [
              ...prevMessages.slice(0, botMessageIndex),
              { role: "bot", message: content, promoType, sender: res.data.isHumanMode ? "human_agent" : "ai" },
            ]);
            scrollToBottom();
          }
        };

        setLoading(false);
        await typewriterEffect(cleanText);

        // Speak aloud if enabled
        speakText(cleanText);

        if (
          wantToShowSuggestions &&
          (content.toLowerCase().includes("sorry") ||
            content.toLowerCase().includes("apologize") ||
            content.toLowerCase().includes("error"))
        ) {
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error fetching response:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "bot", message: "Sorry, something went wrong.", isError: true, sender: "ai" },
        ]);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    } else if (input.trim() === "") {
      alert("Please enter a valid message");
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (name.trim() !== "" && email.trim() !== "") {
      try {
        const response = await generateSession({
          email,
          username: name,
          phone,
          token,
          apiUrl,
        });

        setSession({
          started: true,
          email,
          username: name,
          phone,
          sessionId: response.session._id,
        });
      } catch (error) {
        console.error("Error starting session", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  // Request Live Agent or trigger Offline Mode
  const handleRequestHuman = async () => {
    setShowOfflineModal(true);
  };

  // Submit Offline Lead Capture Form
  const handleSubmitOfflineLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/chatbot/lead`, {
        name: session.username || name || "Website Visitor",
        email: session.email || email,
        phone: session.phone || phone,
        message: offlineMessage,
        source: "offline_form",
        token,
      });

      setOfflineSubmitted(true);
      setTimeout(() => {
        setShowOfflineModal(false);
        setOfflineSubmitted(false);
        setOfflineMessage("");
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            message: "Thank you! Our support team has received your inquiry and will follow up with you via email shortly.",
            sender: "human_agent",
          },
        ]);
      }, 1500);
    } catch (err) {
      console.error("Error submitting offline inquiry:", err);
    }
  };

  useEffect(() => {
    const getSugesstionsList = async () => {
      if (wantToShowSuggestions && showSuggestions) {
        const suggestionsList = await generateSugesstions(bussinessDetails, apiUrl, token);
        setSuggestions(suggestionsList);
      }
    };

    getSugesstionsList();
  }, [wantToShowSuggestions, showSuggestions, bussinessDetails, apiUrl, token]);

  const handleSugesstionClick = async (sugg: string) => {
    if (loading) return;
    setInput(sugg);
    setShowSuggestions(false);
  };

  const headerTitle = botName || (chatbotDetails?.bussinessName ? `${chatbotDetails.bussinessName}` : "Aptus AI Support");

  const renderAvatar = () => {
    if (typeof chatbotAvatar === "string" && chatbotAvatar.startsWith("http")) {
      return <img src={chatbotAvatar} alt="Avatar" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} />;
    }
    if (chatbotAvatar) {
      return <>{chatbotAvatar}</>;
    }
    return <RiRobot2Line size={16} />;
  };

  // Pre-Chat Lead Generation Form
  if (!session.started) {
    return (
      <ChatbotContainer $config={themeConfig}>
        <Header $config={themeConfig}>
          <AvatarCircle $bg="rgba(255, 255, 255, 0.2)" $color="inherit">
            {renderAvatar()}
          </AvatarCircle>
          <span>{headerTitle}</span>
        </Header>

        <FormContainer onSubmit={handleStartSession} $config={themeConfig}>
          <WelcomeContainer $config={themeConfig}>
            <TbMessages size={68} />
          </WelcomeContainer>
          <FormHeading $config={themeConfig}>Welcome! Let's get started.</FormHeading>
          <FormSubheading>Please enter your contact information to begin the chat.</FormSubheading>

          <FormInput
            $config={themeConfig}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name *"
            required
          />
          <FormInput
            $config={themeConfig}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email *"
            required
          />
          <FormInput
            $config={themeConfig}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number (Optional)"
          />
          <FormButton $config={themeConfig} type="submit" disabled={loading}>
            {loading ? "CONNECTING..." : "START CHAT"}
          </FormButton>
        </FormContainer>
      </ChatbotContainer>
    );
  }

  return (
    <ChatbotContainer $config={themeConfig}>
      {/* Header with Live Agent and Voice Controls */}
      <Header $config={themeConfig}>
        <HeaderLeft>
          <AvatarCircle $bg="rgba(255, 255, 255, 0.2)" $color="inherit">
            {renderAvatar()}
          </AvatarCircle>
          <HeaderTitleText>
            <span>{headerTitle}</span>
            <OnlineStatusBadge>● Online</OnlineStatusBadge>
          </HeaderTitleText>
        </HeaderLeft>

        <HeaderControls>
          {/* TTS Audio Toggle */}
          <HeaderIconButton
            title={ttsEnabled ? "Mute Voice Readout" : "Enable Voice Readout"}
            onClick={() => setTtsEnabled(!ttsEnabled)}
            $active={ttsEnabled}
          >
            {ttsEnabled ? <IoVolumeHigh size={18} /> : <IoVolumeMute size={18} />}
          </HeaderIconButton>

          {/* Request Human Agent Button */}
          <HeaderIconButton
            title="Request Live Human Agent"
            onClick={handleRequestHuman}
          >
            <RiCustomerService2Line size={18} />
          </HeaderIconButton>
        </HeaderControls>
      </Header>

      {/* Offline Mode Modal */}
      {showOfflineModal && (
        <ModalOverlay>
          <ModalCard $config={themeConfig}>
            <ModalCloseButton onClick={() => setShowOfflineModal(false)}>✕</ModalCloseButton>
            <RiCustomerService2Line size={32} color={themeConfig.headerBg} />
            <ModalTitle>Live Agent Status</ModalTitle>
            <ModalNotice>
              Right now our team is offline, but please leave your message and email, and a human will get back to you shortly.
            </ModalNotice>
            {offlineSubmitted ? (
              <SuccessBadge>✓ Message sent! We'll reply shortly.</SuccessBadge>
            ) : (
              <form onSubmit={handleSubmitOfflineLead} style={{ width: "100%" }}>
                <ModalTextarea
                  placeholder="What can we help you with?"
                  value={offlineMessage}
                  onChange={(e) => setOfflineMessage(e.target.value)}
                  required
                />
                <FormButton $config={themeConfig} type="submit" style={{ width: "100%", marginTop: 8 }}>
                  SEND TO TEAM
                </FormButton>
              </form>
            )}
          </ModalCard>
        </ModalOverlay>
      )}

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
                  renderAvatar()
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
                      <PromoItem><FaStar color="#f59e0b" /> 99.9% Accuracy</PromoItem>
                    </PromoGrid>
                  </PromoCard>
                )}

                {message.promoType === "trust" && (
                  <PromoCard $config={themeConfig}>
                    <PromoTitle><RiShieldCheckLine color="#10b981" /> Enterprise Trust & Security</PromoTitle>
                    <PromoGrid>
                      <PromoItem>🛡️ 256-Bit SSL Encrypted</PromoItem>
                      <PromoItem>⭐ Rated 4.9/5 by Clients</PromoItem>
                      <PromoItem>👥 10,000+ Happy Users</PromoItem>
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
              <Suggestion key={i} $config={themeConfig} onClick={() => handleSugesstionClick(sugg)}>
                {sugg}
              </Suggestion>
            ))}
          </SuggestionsContainer>
        )}

        {loading && (
          <BotMessageWrapper $config={themeConfig}>
            <AvatarCircle $bg="rgba(0, 0, 0, 0.08)" $color={themeConfig.botBubbleColor || "#1a1a1a"}>
              {renderAvatar()}
            </AvatarCircle>
            <MessageBubble $config={themeConfig} role="bot">
              Typing...
            </MessageBubble>
          </BotMessageWrapper>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Input Bar with Speech-to-Text Mic Icon */}
      <ChatInputContainer $config={themeConfig}>
        {speechSupported && (
          <VoiceButton
            title={isListening ? "Listening... (Click to stop)" : "Speech to Text"}
            onClick={toggleSpeechRecognition}
            $isListening={isListening}
            type="button"
          >
            {isListening ? <IoMicOff size={18} color="#ef4444" /> : <IoMic size={18} />}
          </VoiceButton>
        )}

        <ChatInput
          $config={themeConfig}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          placeholder={isListening ? "Listening to your voice..." : "Type a message..."}
        />
        <SendButton $config={themeConfig} onClick={handleSendMessage}>
          <IoSend size={18} />
        </SendButton>
      </ChatInputContainer>
    </ChatbotContainer>
  );
};

export default Chatbot;

// --- Styled Components ---

const slideUp = keyframes`
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const ChatbotContainer = styled.div<{ $config: ThemeConfig }>`
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
  min-width: 0;
`;

const HeaderTitleText = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 700;
  font-size: 0.95em;
  letter-spacing: 0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OnlineStatusBadge = styled.span`
  font-size: 0.65em;
  font-weight: 500;
  opacity: 0.85;
  color: #86efac;
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderIconButton = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => ($active ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.15)")};
  border: none;
  color: inherit;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }
`;

const FormContainer = styled.form<{ $config: ThemeConfig }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: ${({ $config }) => $config.containerBg};
`;

const WelcomeContainer = styled.div<{ $config: ThemeConfig }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $config }) => $config.headerBg};
  margin-bottom: 8px;
`;

const FormHeading = styled.h3<{ $config: ThemeConfig }>`
  margin: 0 0 4px 0;
  font-size: 1.1em;
  font-weight: 700;
  color: ${({ $config }) => $config.inputColor || "#1f2937"};
  text-align: center;
`;

const FormSubheading = styled.p`
  margin: 0 0 14px 0;
  font-size: 0.8em;
  color: #6b7280;
  text-align: center;
  max-width: 260px;
`;

const FormInput = styled.input<{ $config: ThemeConfig }>`
  width: 100%;
  max-width: 280px;
  font-family: inherit;
  padding: 9px 12px;
  margin: 5px 0;
  border-radius: ${({ $config }) => $config.inputRadius};
  outline: none;
  border: ${({ $config }) => $config.inputBorder};
  font-size: 0.88em;
  font-weight: 500;
  background-color: ${({ $config }) => $config.inputBg} !important;
  color: ${({ $config }) => $config.inputColor} !important;

  &:focus {
    outline: none;
    border: ${({ $config }) => $config.inputFocusBorder};
  }

  ::placeholder {
    color: #9ca3af;
  }
`;

const FormButton = styled.button<{ $config: ThemeConfig }>`
  background-color: ${({ $config }) => $config.buttonBg};
  color: ${({ $config }) => $config.buttonColor};
  border: ${({ $config }) => $config.buttonBorder || "none"};
  font-family: inherit;
  font-weight: 700;
  font-size: 0.85em;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-radius: ${({ $config }) => $config.buttonRadius};
  padding: 10px 18px;
  margin-top: 10px;
  cursor: pointer;
  width: 100%;
  max-width: 280px;
  transition: transform 0.15s, background-color 0.15s;

  &:hover {
    background-color: ${({ $config }) => $config.buttonHoverBg};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const MessagesContainer = styled.div<{ $config: ThemeConfig }>`
  flex: 1;
  padding: 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: ${({ $config }) => $config.messagesBg};

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
  }
`;

const AvatarCircle = styled.div<{ $bg?: string; $color?: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${({ $bg }) => $bg || "rgba(0, 0, 0, 0.08)"};
  color: ${({ $color }) => $color || "inherit"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SenderBadge = styled.span`
  font-size: 0.68em;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-left: 4px;
`;

const BotMessageWrapper = styled.div<{ $config: ThemeConfig }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  align-self: flex-start;
  max-width: 90%;
  animation: ${slideUp} 0.2s ease-out;
`;

const UserMessageWrapper = styled.div<{ $config: ThemeConfig }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  align-self: flex-end;
  max-width: 90%;
  animation: ${slideUp} 0.2s ease-out;
`;

const MessageBubble = styled.div<{ role: "user" | "bot"; $config: ThemeConfig }>`
  align-self: ${(props) => (props.role === "user" ? "flex-end" : "flex-start")};
  background-color: ${(props) =>
    props.role === "user" ? props.$config.userBubbleBg : props.$config.botBubbleBg};
  color: ${(props) =>
    props.role === "user" ? props.$config.userBubbleColor : props.$config.botBubbleColor};
  border: ${(props) =>
    props.role === "user"
      ? props.$config.userBubbleBorder || "none"
      : props.$config.botBubbleBorder || "none"};
  padding: 10px 14px;
  border-radius: ${({ $config }) => $config.bubbleRadius};
  font-weight: 500;
  font-size: 0.88em;
  line-height: 1.4;
  word-break: break-word;
`;

const ChatInputContainer = styled.div<{ $config: ThemeConfig }>`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: ${({ $config }) => $config.inputContainerBg};
  border-top: ${({ $config }) => $config.inputContainerBorderTop};
  gap: 6px;
`;

const VoiceButton = styled.button<{ $isListening?: boolean }>`
  background: ${({ $isListening }) => ($isListening ? "rgba(239, 68, 68, 0.15)" : "transparent")};
  border: 1px solid ${({ $isListening }) => ($isListening ? "#ef4444" : "#e5e7eb")};
  color: ${({ $isListening }) => ($isListening ? "#ef4444" : "#6b7280")};
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  animation: ${({ $isListening }) => ($isListening ? pulse : "none")} 1.2s infinite;
  transition: all 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const ChatInput = styled.input<{ $config: ThemeConfig }>`
  flex: 1;
  border: ${({ $config }) => $config.inputBorder};
  padding: 9px 12px;
  border-radius: ${({ $config }) => $config.inputRadius};
  outline: none;
  font-family: inherit;
  font-weight: 500;
  font-size: 0.88em;
  background-color: ${({ $config }) => $config.inputBg};
  color: ${({ $config }) => $config.inputColor};

  &:focus {
    outline: none;
    border: ${({ $config }) => $config.inputFocusBorder};
  }
`;

const SendButton = styled.button<{ $config: ThemeConfig }>`
  background-color: ${({ $config }) => $config.buttonBg};
  color: ${({ $config }) => $config.buttonColor};
  border: ${({ $config }) => $config.buttonBorder || "none"};
  border-radius: ${({ $config }) => $config.buttonRadius};
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, background-color 0.15s;

  &:hover {
    background-color: ${({ $config }) => $config.buttonHoverBg};
  }
`;

const SuggestionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  animation: ${slideUp} 0.25s ease-out;
`;

const Suggestion = styled.div<{ $config: ThemeConfig }>`
  background-color: ${({ $config }) => $config.suggestionBg};
  color: ${({ $config }) => $config.suggestionColor};
  border: ${({ $config }) => $config.suggestionBorder || "none"};
  padding: 6px 10px;
  border-radius: ${({ $config }) => $config.bubbleRadius};
  font-size: 0.82em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s;

  &:hover {
    transform: translateY(-2px);
  }
`;

// In-Chat Promotional Media Card Components
const PromoCard = styled.div<{ $config: ThemeConfig }>`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  margin-top: 4px;
  width: 100%;
  box-sizing: border-box;
  animation: ${slideUp} 0.3s ease-out;
`;

const PromoTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82em;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
`;

const PromoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
`;

const PromoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78em;
  color: #4b5563;
  font-weight: 500;
`;

// Live Agent Offline Modal Components
const ModalOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalCard = styled.div<{ $config: ThemeConfig }>`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #9ca3af;
`;

const ModalTitle = styled.h4`
  margin: 8px 0 6px 0;
  font-size: 1em;
  font-weight: 700;
  color: #111827;
`;

const ModalNotice = styled.p`
  margin: 0 0 12px 0;
  font-size: 0.82em;
  color: #4b5563;
  line-height: 1.4;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  height: 60px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
  font-family: inherit;
  font-size: 0.85em;
  resize: none;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SuccessBadge = styled.div`
  background: #ecfdf5;
  color: #065f46;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85em;
  font-weight: 600;
`;
