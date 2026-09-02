// Clean SVG icon set for GenAI platform — no emojis

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const defaultSize = 18;

export function IconDashboard({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

export function IconCourses({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 6C4 4.9 4.9 4 6 4H14C15.1 4 16 4.9 16 6V15C16 16.1 15.1 17 14 17H6C4.9 17 4 16.1 4 15V6Z" stroke={color} strokeWidth="1.5"/>
      <path d="M7 8H13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 11H11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 6L4 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 10L4 10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 14L4 14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconMastery({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="4" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="1.5" fill={color}/>
      <path d="M10 2.5V4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 16V17.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2.5 10H4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 10H17.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconTutor({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 3C6.686 3 4 5.462 4 8.5C4 10.108 4.71 11.56 5.85 12.6L5.5 16L9.1 14.45C9.39 14.48 9.69 14.5 10 14.5C13.314 14.5 16 12.038 16 9C16 5.962 13.314 3 10 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7.5 8.5H10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7.5 10.5H9.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 8C17.2 8.6 18 9.7 18 11C18 12.3 17.2 13.4 16 14V16L13.8 14.8C13.5 14.9 13.3 14.9 13 14.9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconDiagnostic({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M5 3H15C15.6 3 16 3.4 16 4V16C16 16.6 15.6 17 15 17H5C4.4 17 4 16.6 4 16V4C4 3.4 4.4 3 5 3Z" stroke={color} strokeWidth="1.5"/>
      <path d="M7 7H13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 10H13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 13H10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14" cy="14" r="3" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5"/>
      <path d="M14 13V14.5L15 15.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconPractice({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 10C3 6.134 6.134 3 10 3C13.866 3 17 6.134 17 10C17 13.866 13.866 17 10 17C6.134 17 3 13.866 3 10Z" stroke={color} strokeWidth="1.5"/>
      <path d="M10 7V10L12 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 3.5L3.5 7" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M13 3.5L16.5 7" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

export function IconReassessment({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 10C4 6.686 6.686 4 10 4C12.21 4 14.15 5.17 15.2 6.9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 10C16 13.314 13.314 16 10 16C7.79 16 5.85 14.83 4.8 13.1" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15.5 4L15.2 6.9L12.5 6.3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.5 16L4.8 13.1L7.5 13.7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 10L9.5 11.5L12 8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconProfile({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7.5" r="3" stroke={color} strokeWidth="1.5"/>
      <path d="M4 16C4 13.239 6.686 11 10 11C13.314 11 16 13.239 16 16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconMoon({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M17 12.5C15.8 13.8 14.1 14.5 12.2 14.5C8.5 14.5 5.5 11.5 5.5 7.8C5.5 5.9 6.2 4.2 7.5 3C4.3 3.6 2 6.4 2 9.8C2 13.7 5.3 17 9.2 17C12.6 17 15.4 14.7 17 12.5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconSun({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3.5" stroke={color} strokeWidth="1.5"/>
      <path d="M10 2.5V4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 16V17.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4.22 4.22L5.28 5.28" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14.72 14.72L15.78 15.78" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2.5 10H4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 10H17.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4.22 15.78L5.28 14.72" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14.72 5.28L15.78 4.22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconGlobe({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.5"/>
      <path d="M10 2.5C10 2.5 7.5 5.5 7.5 10C7.5 14.5 10 17.5 10 17.5" stroke={color} strokeWidth="1.5"/>
      <path d="M10 2.5C10 2.5 12.5 5.5 12.5 10C12.5 14.5 10 17.5 10 17.5" stroke={color} strokeWidth="1.5"/>
      <path d="M2.5 10H17.5" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

export function IconChevronRight({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M8 5L13 10L8 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconChevronLeft({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M12 5L7 10L12 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconArrowRight({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 10H16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M11 5L16 10L11 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconArrowLeft({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M16 10H4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 5L4 10L9 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconCheck({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 10L8 14L16 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconAnchor({ size = 12, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="3" r="1.5" stroke={color} strokeWidth="1.2"/>
      <path d="M6 4.5V9" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M3 7C3 7 3.5 9 6 9C8.5 9 9 7 9 7" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M4 6H8" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconWarning({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M9.11 3.94L2.2 15.5C2.07 15.72 2 15.97 2 16.22C2 17.2 2.8 18 3.78 18H16.22C17.2 18 18 17.2 18 16.22C18 15.97 17.93 15.72 17.8 15.5L10.89 3.94C10.64 3.51 10.13 3.24 9.58 3.24C9.03 3.24 8.52 3.51 8.27 3.94" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 8V12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="14.5" r="0.75" fill={color}/>
    </svg>
  );
}

export function IconSparkle({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2L11.5 8L17 9.5L11.5 11L10 17L8.5 11L3 9.5L8.5 8L10 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M16 3L16.5 5L18 5.5L16.5 6L16 8L15.5 6L14 5.5L15.5 5L16 3Z" stroke={color} strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconBookOpen({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 5C10 5 7 4 4 4.5V15.5C7 15 10 16 10 16V5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 5C10 5 13 4 16 4.5V15.5C13 15 10 16 10 16V5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconLock({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="4" y="9" width="12" height="9" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M7 9V6.5C7 4.567 8.343 3 10 3C11.657 3 13 4.567 13 6.5V9" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="13.5" r="1" fill={color}/>
    </svg>
  );
}

export function IconEye({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M2 10C2 10 5 5 10 5C15 5 18 10 18 10C18 10 15 15 10 15C5 15 2 10 2 10Z" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="2.5" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

export function IconEyeOff({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 3L17 17" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.5 5.8C3.7 7 2 10 2 10C2 10 5 15 10 15C11.6 15 13 14.5 14.2 13.7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 5.1C9.3 5 9.7 5 10 5C15 5 18 10 18 10C18 10 17.3 11.3 16 12.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconLogoBrand({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#1B4DA8"/>
      <path d="M14 5L21 9.5V18.5L14 23L7 18.5V9.5L14 5Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <circle cx="14" cy="14" r="3" fill="white" fillOpacity="0.9"/>
    </svg>
  );
}

export function IconSend({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M17 3L3 9.5L9 11L11 17L17 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 11L13 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconSendRtl({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ transform: "scaleX(-1)" }}>
      <path d="M17 3L3 9.5L9 11L11 17L17 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 11L13 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconFilter({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 5H17" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 10H14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 15H11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconTrendUp({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 14L8 9L11 12L17 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 5H17V9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconInfo({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.5"/>
      <path d="M10 9V14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="6.5" r="0.75" fill={color}/>
    </svg>
  );
}

export function IconBell({ size = defaultSize, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 3C7.24 3 5 5.24 5 8V13L3 15H17L15 13V8C15 5.24 12.76 3 10 3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8.5 15C8.5 15.83 9.17 16.5 10 16.5C10.83 16.5 11.5 15.83 11.5 15" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}
