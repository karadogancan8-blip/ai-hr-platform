type IconProps = {
  className?: string;
};

export function IconDashboard({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 13h7V4H4v9Zm9 7h7v-9h-7v9ZM4 20h7v-5H4v5Zm9-16v5h7V4h-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconRecruit({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3.5 20.2c.6-3.2 3.2-5.2 6.5-5.2 1.1 0 2.1.2 3 .6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16.5 13.5 21 18l-1.5 1.5-4.5-4.5v-1.1l1.1-1.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPolicy({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M14 4v4h4M8.5 12h7M8.5 15.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconLeave({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m9 15 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconUpload({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15V7m0 0 3.5 3.5M12 7 8.5 10.5M5 17.5A3.5 3.5 0 0 0 8 21h8a4 4 0 0 0 .4-8H16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19.4 13.5a7.8 7.8 0 0 0 .1-1.5 7.8 7.8 0 0 0-.1-1.5l2-1.5-2-3.5-2.4 1a7.4 7.4 0 0 0-2.6-1.5L14 2h-4l-.4 2.5a7.4 7.4 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5a7.8 7.8 0 0 0-.1 1.5 7.8 7.8 0 0 0 .1 1.5l-2 1.5 2 3.5 2.4-1a7.4 7.4 0 0 0 2.6 1.5L10 22h4l.4-2.5a7.4 7.4 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCreditCard({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18M7 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconSend({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 12 20 5l-6.5 14-2.2-5.8L4 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconOnboarding({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v4M12 21a7 7 0 0 0 7-7c0-4-3-7-7-11-4 4-7 7-7 11a7 7 0 0 0 7 7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconTimesheet({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v4.5l3 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPerformance({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19V9M10 19V5M16 19v-7M20 19H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
