export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CompanyRow = {
  id: string;
  name: string;
  plan_type?: string | null;
  subscription_status?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  access_control?: Json | null;
  created_at?: string | null;
};

export type ProfileRow = {
  id: string;
  company_id: string;
  email?: string | null;
  role?: string | null;
  created_at?: string | null;
};

export type LeaveRequestRow = {
  id: string;
  company_id?: string | null;
  employee?: string | null;
  employee_name?: string | null;
  department?: string | null;
  type?: string | null;
  leave_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  days?: number | null;
  reason?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export type ResumeRow = {
  id: string;
  company_id?: string | null;
  candidate_name?: string | null;
  name?: string | null;
  match_score?: number | null;
  score?: number | null;
  analysis_summary?: string | null;
  summary?: string | null;
  role?: string | null;
  skills?: string[] | null;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
  interview_score?: number | null;
  interview_notes?: string | null;
  created_at?: string | null;
};

export type OnboardingPlanRow = {
  id: string;
  company_id?: string | null;
  employee_name?: string | null;
  role?: string | null;
  department?: string | null;
  plan?: Json | null;
  status?: string | null;
  created_at?: string | null;
};

export type PerformanceReviewRow = {
  id: string;
  company_id?: string | null;
  employee_name?: string | null;
  period?: string | null;
  notes?: string | null;
  summary?: string | null;
  strengths?: string[] | null;
  improvements?: string[] | null;
  goals?: string[] | null;
  score?: number | null;
  created_at?: string | null;
};

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: CompanyRow;
        Insert: {
          id?: string;
          name: string;
          plan_type?: string;
          subscription_status?: string;
          logo_url?: string | null;
          primary_color?: string | null;
          access_control?: Json | null;
          created_at?: string;
        };
        Update: Partial<CompanyRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: { id: string; company_id: string; email?: string | null; role?: string | null; created_at?: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      leave_requests: {
        Row: LeaveRequestRow;
        Insert: Partial<Omit<LeaveRequestRow, "id" | "created_at">> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<LeaveRequestRow>;
        Relationships: [];
      };
      resumes: {
        Row: ResumeRow;
        Insert: Partial<Omit<ResumeRow, "id" | "created_at">> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<ResumeRow>;
        Relationships: [];
      };
      onboarding_plans: {
        Row: OnboardingPlanRow;
        Insert: Partial<Omit<OnboardingPlanRow, "id" | "created_at">> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<OnboardingPlanRow>;
        Relationships: [];
      };
      performance_reviews: {
        Row: PerformanceReviewRow;
        Insert: Partial<Omit<PerformanceReviewRow, "id" | "created_at">> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<PerformanceReviewRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
