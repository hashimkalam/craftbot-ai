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
    desc: "Customize your chatbot's personality, tone, and responses to fit your brand voice effortlessly, whether for support or feedback collection.",
    icon: GlobeIcon,
  },
  {
    name: "Dual Interaction Channels",
    desc: "Separate sections for customer support and feedback, enabling users to ask questions and provide structured feedback seamlessly.",
    icon: GlobeIcon,
  },
  {
    name: "Sentiment Analysis & Feedback Trends",
    desc: "Automatically analyze feedback sentiment and view trends over time in a dedicated dashboard, providing insights on user satisfaction.",
    icon: GlobeIcon,
  },
  {
    name: "Real-Time Analytics Dashboard",
    desc: "Access analytics on user engagement, time spent, total feedback received, and user interaction trends with visual insights.",
    icon: GlobeIcon,
  },
  {
    name: "Chat & Feedback History",
    desc: "Review chat history with sentiment highlights and feedback summaries for efficient review and actionable insights.",
    icon: GlobeIcon,
  },
  {
    name: "Multi-Platform Deployment",
    desc: "Easily deploy your chatbot across websites and apps with iframe code, ensuring wide reach and accessibility.",
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
