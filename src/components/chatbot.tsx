import React, { useState, useEffect, useRef, ReactNode } from "react";
import generateSession from "../utils/generateSession";
import axios from "axios";
import styled from "styled-components";
import { IoSend, IoMic, IoMicOff } from "react-icons/io5";
import { TbUser, TbMessageCircleOff, TbMessageChatbot, TbUserHeart, TbRobot, TbRobotFace } from "react-icons/tb";
import {
  RiRobot2Line,
  RiRobot3Line,
  RiRobotLine,
  RiCustomerService2Line,
  RiShieldCheckLine,
  RiSecurePaymentLine,
  RiSparklingFill,
  RiQuestionAnswerLine,
  RiRefreshLine,
} from "react-icons/ri";
import { FaStar, FaBolt, FaLock, FaBrain, FaRobot } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import generateSugesstions from "../utils/generateSuggestions";
import { getThemeConfig, ThemeConfig } from "../theme";
import { getContrastColor } from "../App";

interface Message {
  role: "user" | "bot" | "chatbot";
  message: string;
  isError?: boolean;
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

// Safe, dependency-free Markdown parser for formatted chat replies
const FormattedMessage: React.FC<{ content: string; color?: string }> = ({ content, color }) => {
  if (!content) return null;

  const parseInline = (text: string): React.ReactNode[] => {
    const tokenRegex = /(\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*([^*]+)\*|_([^_]+)_)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }

      if (match[2] || match[3]) {
        elements.push(
          <strong key={match.index} style={{ fontWeight: 700, color: "inherit" }}>
            {match[2] || match[3]}
          </strong>
        );
      } else if (match[4]) {
        elements.push(
          <code
            key={match.index}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.08)",
              padding: "1px 5px",
              borderRadius: "3px",
              fontFamily: "monospace",
              fontSize: "0.9em",
            }}
          >
            {match[4]}
          </code>
        );
      } else if (match[5] && match[6]) {
        elements.push(
          <a
            key={match.index}
            href={match[6]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "inherit", fontWeight: 600 }}
          >
            {match[5]}
          </a>
        );
      } else if (match[7] || match[8]) {
        elements.push(
          <em key={match.index} style={{ fontStyle: "italic" }}>
            {match[7] || match[8]}
          </em>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements;
  };

  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === "ul") {
        blocks.push(
          <ul
            key={`list-${blocks.length}`}
            style={{
              paddingLeft: "18px",
              margin: "4px 0 6px 0",
              listStyleType: "disc",
            }}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} style={{ marginBottom: "3px", lineHeight: 1.5 }}>
                {item}
              </li>
            ))}
          </ul>
        );
      } else {
        blocks.push(
          <ol
            key={`list-${blocks.length}`}
            style={{
              paddingLeft: "18px",
              margin: "4px 0 6px 0",
              listStyleType: "decimal",
            }}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} style={{ marginBottom: "3px", lineHeight: 1.5 }}>
                {item}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    const ulMatch = line.match(/^[-*•]\s+(.+)/);
    if (ulMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(parseInline(ulMatch[1]));
      return;
    }

    const olMatch = line.match(/^\d+[.)]\s+(.+)/);
    if (olMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(parseInline(olMatch[1]));
      return;
    }

    flushList();

    const headerMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      blocks.push(
        <div
          key={`header-${index}`}
          style={{
            fontWeight: 800,
            fontSize: level === 1 ? "1.15em" : level === 2 ? "1.05em" : "1em",
            marginTop: "6px",
            marginBottom: "3px",
          }}
        >
          {parseInline(headerMatch[2])}
        </div>
      );
      return;
    }

    blocks.push(
      <p
        key={`p-${index}`}
        style={{
          margin: "0 0 5px 0",
          lineHeight: 1.55,
        }}
      >
        {parseInline(line)}
      </p>
    );
  });

  flushList();

  return <div style={{ color }}>{blocks}</div>;
};

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

  // Visitor Onboarding States (Remember name and optional email in localStorage)
  const [needsName, setNeedsName] = useState<boolean>(false);
  const [visitorNameInput, setVisitorNameInput] = useState<string>("");
  const [visitorEmailInput, setVisitorEmailInput] = useState<string>("");

  // Voice States (Real-time live streaming STT + Groq Whisper multilingual)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const hasLiveTranscribedRef = useRef(false);

  // Cleanly terminate all active microphone recording & hardware streams
  const stopAllAudio = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.requestData();
        }
        mediaRecorderRef.current.stop();
      } catch (e) {}
    } else if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      } catch (e) {}
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
  };

  // Cleanup mic hardware stream on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

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

  const getVisitorId = (): string => {
    try {
      let vid = localStorage.getItem("aptus_visitor_id");
      if (!vid) {
        vid = "v_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem("aptus_visitor_id", vid);
      }
      return vid;
    } catch (e) {
      return "v_" + Date.now();
    }
  };

  const createVisitorSession = async (name: string, email: string) => {
    if (!token || !apiUrl) return null;
    try {
      const visitorId = getVisitorId();
      const response = await generateSession({
        email: email || "visitor@web.local",
        username: name || "Website Visitor",
        phone: "",
        token,
        apiUrl,
        visitorId,
      });

      if (response?.session?._id) {
        setSession({
          started: true,
          email: email || "visitor@web.local",
          username: name || "Website Visitor",
          phone: "",
          sessionId: response.session._id,
        });

        return response.session._id;
      }
    } catch (err) {
      console.warn("Session init notice:", err);
    }
    return null;
  };

  // Check saved visitor profile in localStorage on mount (asks only once)
  useEffect(() => {
    let savedProfile: any = null;
    try {
      const stored = localStorage.getItem("aptus_visitor_profile");
      if (stored) savedProfile = JSON.parse(stored);
    } catch (e) {}

    if (savedProfile && savedProfile.name && savedProfile.name.trim()) {
      setVisitorNameInput(savedProfile.name.trim());
      setVisitorEmailInput(savedProfile.email ? savedProfile.email.trim() : "");
      setNeedsName(false);
      createVisitorSession(savedProfile.name.trim(), savedProfile.email || "visitor@web.local");
    } else {
      setNeedsName(true);
    }
  }, [token, apiUrl]);

  const handleSaveVisitorName = async () => {
    const cleanName = visitorNameInput.trim() || "Website Visitor";
    const cleanEmail = visitorEmailInput.trim() || "visitor@web.local";
    const profile = { name: cleanName, email: cleanEmail };
    try {
      localStorage.setItem("aptus_visitor_profile", JSON.stringify(profile));
    } catch (e) {}
    setNeedsName(false);

    if (cleanName !== "Website Visitor") {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          message: `Nice to meet you, ${cleanName}! How can I assist you today?`,
          sender: "ai",
        },
      ]);
    }

    await createVisitorSession(cleanName, cleanEmail);
  };

  // Voice Input: Real-time speech recognition (word-by-word streaming) + Groq Whisper fallback
  const toggleRecording = async () => {
    if (isRecording) {
      stopAllAudio();
    } else {
      hasLiveTranscribedRef.current = false;

      // 1. Start Real-time live SpeechRecognition if supported by browser
      const SpeechRecClass =
        typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

      if (SpeechRecClass) {
        try {
          const recognition = new SpeechRecClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang =
            typeof navigator !== "undefined" && navigator.languages && navigator.languages.length > 0
              ? navigator.languages[0]
              : "en-US";

          const initialInput = input.trim();

          recognition.onresult = (event: any) => {
            let interimTranscript = "";
            let finalTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
              const res = event.results[i];
              if (res.isFinal) {
                finalTranscript += res[0].transcript + " ";
              } else {
                interimTranscript += res[0].transcript;
              }
            }
            const liveWords = (finalTranscript + interimTranscript).trim();
            if (liveWords) {
              hasLiveTranscribedRef.current = true;
              setInput(initialInput ? `${initialInput} ${liveWords}` : liveWords);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn("Live speech recognition notice:", e?.error);
            setIsRecording(false);
          };

          recognition.onend = () => {
            recognitionRef.current = null;
            setIsRecording(false);
          };

          recognition.start();
          recognitionRef.current = recognition;
          setIsRecording(true);
          return;
        } catch (recErr) {
          console.warn("Real-time speech recognition could not start, falling back to audio recording:", recErr);
        }
      }

      // 2. Fallback to MediaRecorder + Whisper only if Web Speech is unavailable
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

        mediaStreamRef.current = stream;

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
          // Immediately stop all hardware tracks
          if (mediaStreamRef.current) {
            try {
              mediaStreamRef.current.getTracks().forEach((track) => {
                track.stop();
                track.enabled = false;
              });
            } catch (e) {}
            mediaStreamRef.current = null;
          }

          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          if (audioBlob.size < 300) {
            setIsRecording(false);
            setIsTranscribing(false);
            return;
          }

          setIsTranscribing(true);
          try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              try {
                const base64Audio = reader.result as string;
                const res = await axios.post(
                  `${apiUrl}/chatbot/transcribe`,
                  {
                    audio: base64Audio,
                    mimeType: mimeType,
                    token: token,
                    prompt: "Natural conversation with assistant in English, Urdu (اردو), or Roman Urdu (e.g. 'pricing kya hai', 'details batao').",
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      "x-chatbot-token": token,
                    },
                    timeout: 25000,
                  }
                );

                if (res.data?.success && res.data.text) {
                  const transcribedText = res.data.text.trim();
                  if (transcribedText) {
                    setInput(transcribedText);
                  }
                }
              } catch (err: any) {
                console.warn("Groq Whisper transcription notice:", err?.response?.data?.message || err.message);
              } finally {
                setIsTranscribing(false);
                setIsRecording(false);
              }
            };
          } catch (err: any) {
            console.error("Audio processing notice:", err);
            setIsTranscribing(false);
            setIsRecording(false);
          }
        };

        mediaRecorder.start(250);
        setIsRecording(true);
      } catch (err) {
        console.warn("Audio recording hardware notice:", err);
        setIsRecording(false);
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
          let savedName = "Website Visitor";
          let savedEmail = "visitor@web.local";
          try {
            const stored = localStorage.getItem("aptus_visitor_profile");
            if (stored) {
              const p = JSON.parse(stored);
              if (p?.name) savedName = p.name;
              if (p?.email) savedEmail = p.email;
            }
          } catch (e) {}

          const sessRes = await generateSession({
            email: savedEmail,
            username: savedName,
            phone: "",
            token,
            apiUrl,
            visitorId: getVisitorId(),
          });
          activeSessionId = sessRes.session._id;
          setSession({
            started: true,
            email: savedEmail,
            username: savedName,
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

        // Clean any residual promo tags so the agent never injects out-of-theme cards
        const cleanText = (content || "").replace(/\[PROMO:[^\]]+\]/g, "").trim();

        await typewriterEffect(cleanText);

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

  // Start a fresh new chat conversation
  const handleNewChat = async () => {
    setMessages([
      {
        role: "bot",
        message: welcomeMessage || "Hello! How can I assist you today?",
        sender: "ai",
      },
    ]);
    const savedName = visitorNameInput.trim() || "Website Visitor";
    const savedEmail = visitorEmailInput.trim() || "visitor@web.local";
    await createVisitorSession(savedName, savedEmail);
    scrollToBottom();
  };

  // Request Live Agent
  const handleRequestHuman = async () => {
    if (session?.sessionId) {
      try {
        await axios.post(
          `${apiUrl}/session/request-human`,
          { sessionId: session.sessionId },
          { headers: { "x-chatbot-token": token } }
        );
      } catch (e) {
        // Silently continue
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        message: "You've requested a live support agent! A support representative will take over this chat shortly. Please feel free to type your question.",
        sender: "human_agent",
      },
    ]);
    scrollToBottom();
  };

  // Poll for live support agent replies in the active session
  useEffect(() => {
    if (!session?.sessionId || !apiUrl || !token) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await axios.get(`${apiUrl}/session/messages`, {
          params: { sessionId: session.sessionId },
          headers: { "x-chatbot-token": token },
        });

        if (res.data?.success && Array.isArray(res.data.messages)) {
          const serverMsgs = res.data.messages;
          setMessages((prevMsgs) => {
            const newHumanMsgs = serverMsgs.filter(
              (sm: any) =>
                sm.sender === "human_agent" &&
                !prevMsgs.some((pm) => pm.message === sm.message && pm.sender === "human_agent")
            );

            if (newHumanMsgs.length > 0) {
              const formattedNew = newHumanMsgs.map((m: any) => ({
                role: "bot" as const,
                message: m.message,
                sender: "human_agent" as const,
              }));
              setTimeout(scrollToBottom, 50);
              return [...prevMsgs, ...formattedNew];
            }
            return prevMsgs;
          });
        }
      } catch (err) {
        // Silent error
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [session?.sessionId, apiUrl, token]);

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
    if (!chatbotAvatar || chatbotAvatar === "bot" || chatbotAvatar === "default") {
      return <RiRobot2Line size={size} color={color} />;
    }
    if (chatbotAvatar === "cyber") return <FaRobot size={size} color={color} />;
    if (chatbotAvatar === "android") return <TbRobot size={size} color={color} />;
    if (chatbotAvatar === "mecha") return <TbRobotFace size={size} color={color} />;
    if (chatbotAvatar === "friendly") return <RiRobot2Line size={size} color={color} />;
    if (chatbotAvatar === "futuristic") return <RiRobot3Line size={size} color={color} />;
    if (chatbotAvatar === "smart") return <RiRobotLine size={size} color={color} />;
    if (chatbotAvatar === "sparkles" || chatbotAvatar === "spark") return <RiSparklingFill size={size} color={color} />;
    if (chatbotAvatar === "chat" || chatbotAvatar === "message") return <TbMessageChatbot size={size} color={color} />;
    if (chatbotAvatar === "agent" || chatbotAvatar === "support") return <RiCustomerService2Line size={size} color={color} />;
    if (chatbotAvatar === "concierge" || chatbotAvatar === "assistant") return <TbUserHeart size={size} color={color} />;
    if (chatbotAvatar === "shield" || chatbotAvatar === "security") return <RiShieldCheckLine size={size} color={color} />;
    if (chatbotAvatar === "faq" || chatbotAvatar === "help") return <RiQuestionAnswerLine size={size} color={color} />;

    // Legacy fallbacks
    if (chatbotAvatar === "brain") return <RiRobot2Line size={size} color={color} />;
    if (chatbotAvatar === "cpu") return <TbMessageChatbot size={size} color={color} />;
    if (chatbotAvatar === "zap") return <RiSparklingFill size={size} color={color} />;
    if (chatbotAvatar === "wand") return <RiCustomerService2Line size={size} color={color} />;

    if (
      typeof chatbotAvatar === "string" &&
      (chatbotAvatar.startsWith("http://") || chatbotAvatar.startsWith("https://") || chatbotAvatar.startsWith("data:image/"))
    ) {
      return (
        <img
          src={chatbotAvatar}
          alt="Avatar"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = "none";
          }}
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
            $config={themeConfig}
            title="Start Fresh New Chat"
            onClick={handleNewChat}
            style={{ color: themeConfig.headerColor }}
          >
            <RiRefreshLine size={16} />
          </HeaderIconButton>
          <HeaderIconButton
            $config={themeConfig}
            title="Request Live Human Agent"
            onClick={handleRequestHuman}
            style={{ color: themeConfig.headerColor }}
          >
            <RiCustomerService2Line size={18} />
          </HeaderIconButton>
          {onClose && (
            <HeaderIconButton
              $config={themeConfig}
              title="Close Chat"
              onClick={onClose}
              style={{ color: themeConfig.headerColor }}
            >
              <AiOutlineClose size={16} />
            </HeaderIconButton>
          )}
        </HeaderControls>
      </Header>

      {/* Pre-Chat Lead Capture Gate */}
      {needsName ? (
        <PreChatContainer $config={themeConfig}>
          <div style={{ textAlign: "center", marginBottom: "16px", width: "100%" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(0, 0, 0, 0.06)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "10px",
                color: themeConfig.buttonBg || "#FF4D00",
              }}
            >
              {renderAvatar(28, themeConfig.buttonBg || "#FF4D00")}
            </div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 800, color: themeConfig.botBubbleColor || "#111" }}>
              Welcome to {headerTitle}
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "rgba(0,0,0,0.6)", lineHeight: 1.4 }}>
              Introduce yourself to start chatting:
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveVisitorName();
            }}
            style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}
          >
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px", color: themeConfig.botBubbleColor || "#111" }}>
                Name <span style={{ opacity: 0.5, fontWeight: 500 }}>(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={visitorNameInput}
                onChange={(e) => setVisitorNameInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: themeConfig.inputRadius || "4px",
                  border: themeConfig.inputBorder || "1px solid rgba(0,0,0,0.2)",
                  backgroundColor: themeConfig.inputBg || "#fff",
                  color: themeConfig.inputColor || "#111",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px", color: themeConfig.botBubbleColor || "#111" }}>
                Email <span style={{ opacity: 0.5, fontWeight: 500 }}>(Optional)</span>
              </label>
              <input
                type="email"
                placeholder="Your Email (Optional)"
                value={visitorEmailInput}
                onChange={(e) => setVisitorEmailInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: themeConfig.inputRadius || "4px",
                  border: themeConfig.inputBorder || "1px solid rgba(0,0,0,0.2)",
                  backgroundColor: themeConfig.inputBg || "#fff",
                  color: themeConfig.inputColor || "#111",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: "6px",
                width: "100%",
                padding: "11px 16px",
                backgroundColor: themeConfig.buttonBg || "#FF4D00",
                color: themeConfig.buttonColor || "#FFFFFF",
                border: themeConfig.buttonBorder || "none",
                borderRadius: themeConfig.buttonRadius || "4px",
                fontWeight: 800,
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                cursor: "pointer",
                boxShadow: themeConfig.buttonShadow || "none",
                transition: "opacity 0.15s ease",
              }}
            >
              Start Chat
            </button>
          </form>
        </PreChatContainer>
      ) : (
        <>
          {/* Messages Feed */}
          <MessagesContainer ref={messagesContainerRef} $config={themeConfig}>
            {messages.map((message, index) =>
              message.role === "bot" || message.role === "chatbot" || message.sender === "ai" || message.sender === "human_agent" ? (
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
                      <FormattedMessage content={message.message} color={themeConfig.botBubbleColor} />
                    </MessageBubble>
                  </div>
                </BotMessageWrapper>
              ) : (
                <UserMessageWrapper key={index} $config={themeConfig}>
                  <MessageBubble $config={themeConfig} role="user">
                    <FormattedMessage content={message.message} color={themeConfig.userBubbleColor} />
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

          {/* Input Bar with Input, Voice Mic on Right, and Send */}
          <ChatInputContainer $config={themeConfig}>
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
            <VoiceButton
              $config={themeConfig}
              title={isRecording ? "Recording voice... Click to convert" : isTranscribing ? "Transcribing voice with Whisper..." : "Voice Input (Whisper STT)"}
              onClick={toggleRecording}
              $isListening={isRecording}
              type="button"
              disabled={isTranscribing}
            >
              {isRecording ? <IoMicOff size={18} color="#ef4444" /> : <IoMic size={18} />}
            </VoiceButton>
            <SendButton $config={themeConfig} onClick={handleSendMessage} disabled={loading}>
              <IoSend size={18} />
            </SendButton>
          </ChatInputContainer>
        </>
      )}
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

const HeaderIconButton = styled.button<{ $config?: ThemeConfig; $active?: boolean }>`
  background: ${({ $active }) => ($active ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.15)")};
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: inherit;
  border-radius: ${({ $config }) => ($config?.buttonRadius !== undefined ? $config.buttonRadius : "0px")};
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

const PreChatContainer = styled.div<{ $config: ThemeConfig }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 28px 24px;
  background-color: ${({ $config }) => $config.containerBg};
  font-family: ${({ $config }) => $config.fontFamily};
  box-sizing: border-box;
  overflow-y: auto;
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

  ${({ role, $config }) =>
    role === "user"
      ? `
    background-color: ${$config.userBubbleBg};
    color: ${$config.userBubbleColor};
    border-radius: ${$config.bubbleRadius || $config.userBubbleRadius || $config.wrapperRadius || "0px"};
    border: ${$config.userBubbleBorder};
    box-shadow: ${$config.userBubbleShadow};
  `
      : `
    background-color: ${$config.botBubbleBg};
    color: ${$config.botBubbleColor};
    border-radius: ${$config.bubbleRadius || $config.botBubbleRadius || $config.wrapperRadius || "0px"};
    border: ${$config.botBubbleBorder};
    box-shadow: ${$config.botBubbleShadow};
  `}
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
  border-radius: ${({ $config }) => $config.buttonRadius || $config.bubbleRadius || "0px"};
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
  background-color: ${({ $config }) => $config.inputContainerBg || $config.inputAreaBg || "white"};
  border-top: ${({ $config }) => $config.inputContainerBorderTop || $config.inputAreaBorderTop || "2px solid #1a1a1a"};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VoiceButton = styled.button<{ $config: ThemeConfig; $isListening: boolean }>`
  background-color: ${({ $isListening, $config }) => ($isListening ? "#fee2e2" : $config.inputBg || "#ffffff")};
  border: ${({ $isListening, $config }) => ($isListening ? "2px solid #ef4444" : $config.inputBorder || "1px solid #1a1a1a")};
  color: ${({ $isListening, $config }) => ($isListening ? "#ef4444" : $config.inputColor || "#1a1a1a")};
  border-radius: ${({ $config }) => ($config.buttonRadius !== undefined ? $config.buttonRadius : "0px")};
  box-shadow: ${({ $config }) => ($config.buttonShadow ? $config.buttonShadow : "none")};
  width: 38px;
  height: 38px;
  min-width: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  animation: ${({ $isListening }) => ($isListening ? "aptusPulse 1.2s infinite ease-in-out" : "none")};

  &:hover {
    background-color: ${({ $isListening }) => ($isListening ? "#fecaca" : "#f3f4f6")};
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChatInput = styled.input<{ $config: ThemeConfig }>`
  flex: 1;
  padding: 10px 14px;
  font-size: 13px;
  background-color: ${({ $config }) => $config.inputBg || "#ffffff"};
  color: ${({ $config }) => $config.inputColor || "#111827"};
  border: ${({ $config }) => $config.inputBorder || "1px solid #1a1a1a"};
  border-radius: ${({ $config }) => ($config.inputRadius !== undefined ? $config.inputRadius : "0px")};
  outline: none;

  &:focus {
    border-color: ${({ $config }) => $config.inputFocusBorder || $config.headerBg};
  }
`;

const SendButton = styled.button<{ $config: ThemeConfig }>`
  background-color: ${({ $config }) => $config.buttonBg};
  color: ${({ $config }) => $config.buttonColor};
  border: ${({ $config }) => $config.buttonBorder || "none"};
  border-radius: ${({ $config }) => ($config.buttonRadius !== undefined ? $config.buttonRadius : "0px")};
  box-shadow: ${({ $config }) => $config.buttonShadow || "none"};
  width: 38px;
  height: 38px;
  min-width: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: ${({ $config }) => $config.buttonHoverBg || $config.buttonBg};
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
