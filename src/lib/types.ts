export type IdeaStatus = "pool" | "in_progress" | "done" | "archived";

export type Idea = {
  id: string;
  submitted_by: string;
  title: string;
  description: string;
  format: string | null;
  status: IdeaStatus;
  images: string[];
  weight: number;
  pinned: boolean;
  last_edited_by: string | null;
  size_override: "small" | "large" | null;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
  performance_logs?: PerformanceLog[];
};

export type Comment = {
  id: string;
  idea_id: string;
  parent_id: string | null;
  author: string;
  body: string;
  images: string[];
  created_at: string;
  edited_at: string | null;
  reactions: Record<string, string[]>; // emoji -> list of names who reacted
  resolved: boolean;
};

export type PerformanceLog = {
  id: string;
  idea_id: string;
  logged_by: string;
  logged_at: string;
  views: number | null;
  likes: number | null;
  saves: number | null;
  comments_count: number | null;
  note: string | null;
};

export const FORMATS = [
  { value: "ai-can-do-this", label: "AI can do THIS?!" },
  { value: "60-seconds", label: "Do this in 30 seconds" },
  { value: "ai-vs-human", label: "AI vs. Human" },
  { value: "myth-bust", label: "AI myths, busted" },
  { value: "60-sec-challenge", label: "I gave AI 60 seconds to..." },
] as const;
