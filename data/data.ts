import {
  BotMessageSquare,
  GlobeIcon,
  PencilLine,
  SearchIcon,
  LogOutIcon
} from "lucide-react";

export const FEATURES = [
  {
    name: "Easy Customization",
    desc: "Customize your chatbot's personality, tone, and responses to fit your brand voice effortlessly.",
    icon: GlobeIcon,
  },
  {
    name: "Natural Language Processing",
    desc: "Leverage advanced NLP to enable your chatbot to understand and respond to user queries naturally.",
    icon: GlobeIcon,
  },
  {
    name: "Real-Time Conversations",
    desc: "Engage users in real-time with instant responses, enhancing user interaction and satisfaction.",
    icon: GlobeIcon,
  },
  {
    name: "Voice Interaction - (In Progress)",
    desc: "Integrate voice capabilities, allowing users to interact with your chatbot using voice commands.",
    icon: GlobeIcon,
  },
  {
    name: "Analytics Dashboard - (In Progress)",
    desc: "Access insightful analytics on chatbot performance, user interactions, and feedback to optimize experiences.",
    icon: GlobeIcon,
  },
  {
    name: "Multi-Platform Deployment - (In Progress)",
    desc: "Deploy your chatbots across various platforms, including websites and messaging apps, to reach your audience everywhere.",
    icon: GlobeIcon,
  },
];

export const SIDEBAR_OPTIONS = [
  {
    href: "/dashboard/create-chatbot",
    icon: BotMessageSquare,
    title: "Create",
    subtitle: "New Chatbot",
  },
  {
    href: "/dashboard/view-chatbots",
    icon: PencilLine,
    title: "Edit",
    subtitle: "Chatbots",
  },
  {
    href: "/dashboard/review-sessions",
    icon: SearchIcon,
    title: "View",
    subtitle: "Sessions",
  }, 
  {
    icon: LogOutIcon,
    title: "Log Out",
  },
];

export const PERSONALITIES = [
  { id: 'friendly', label: 'Friendly' },
  { id: 'straightforward', label: 'Straightforward' },
  { id: 'professional', label: 'Professional' },
  { id: 'casual', label: 'Casual' },
  { id: 'empathetic', label: 'Empathetic' },
  { id: 'humorous', label: 'Humorous' },
];
