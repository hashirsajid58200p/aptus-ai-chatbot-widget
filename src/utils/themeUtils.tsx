import React, { ReactNode } from "react";
import {
  RiRobot2Line,
  RiRobot3Line,
  RiRobotLine,
  RiCustomerService2Line,
  RiSparklingFill,
  RiShieldCheckLine,
  RiQuestionAnswerLine,
} from "react-icons/ri";
import { TbRobot, TbRobotFace, TbMessageChatbot, TbUserHeart } from "react-icons/tb";
import { FaRobot } from "react-icons/fa";

export function getContrastColor(hexColor?: string): string {
  if (!hexColor || hexColor.startsWith("rgba")) return "#FFFFFF";
  const hex = hexColor.replace("#", "");
  if (hex.length < 6) return "#FFFFFF";
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 145 ? "#111827" : "#FFFFFF";
}

export function renderAvatarIcon(avatar?: string | ReactNode, size = 28, color?: string) {
  if (!avatar || avatar === "bot" || avatar === "default") {
    return <RiRobot2Line size={size} color={color} />;
  }
  if (avatar === "cyber") return <FaRobot size={size} color={color} />;
  if (avatar === "android") return <TbRobot size={size} color={color} />;
  if (avatar === "mecha") return <TbRobotFace size={size} color={color} />;
  if (avatar === "friendly") return <RiRobot2Line size={size} color={color} />;
  if (avatar === "futuristic") return <RiRobot3Line size={size} color={color} />;
  if (avatar === "smart") return <RiRobotLine size={size} color={color} />;
  if (avatar === "sparkles" || avatar === "spark") return <RiSparklingFill size={size} color={color} />;
  if (avatar === "chat" || avatar === "message") return <TbMessageChatbot size={size} color={color} />;
  if (avatar === "agent" || avatar === "support") return <RiCustomerService2Line size={size} color={color} />;
  if (avatar === "concierge" || avatar === "assistant") return <TbUserHeart size={size} color={color} />;
  if (avatar === "shield" || avatar === "security") return <RiShieldCheckLine size={size} color={color} />;
  if (avatar === "faq" || avatar === "help") return <RiQuestionAnswerLine size={size} color={color} />;

  // Legacy mappings for backward compatibility
  if (avatar === "brain") return <RiRobot2Line size={size} color={color} />;
  if (avatar === "cpu") return <TbMessageChatbot size={size} color={color} />;
  if (avatar === "zap") return <RiSparklingFill size={size} color={color} />;
  if (avatar === "wand") return <RiCustomerService2Line size={size} color={color} />;

  if (
    typeof avatar === "string" &&
    (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("data:image/"))
  ) {
    return (
      <img
        src={avatar}
        alt="Avatar"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = "none";
        }}
        style={{ width: `${size}px`, height: `${size}px`, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }
  return <RiRobot2Line size={size} color={color} />;
}
