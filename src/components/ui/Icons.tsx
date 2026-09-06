import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

const baseProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  strokeWidth: 1.5,
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconHeart({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

export function IconDove({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M12 21a9 9 0 0 1-9-9c0-3.5 2.5-6.5 6-7.5C10 2.5 12 2 14 2c4.5 0 7 3.5 7 7 0 2-.5 4-2 5.5l1.5 4.5-4.5-1.5c-1.2.7-2.6 1-4 1z" />
      <path d="M10 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    </svg>
  );
}

export function IconBook({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

export function IconMail({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

export function IconPin({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M15 4.5l4.5 4.5m-3-1.5l3.5 3.5c.78.78.22 2.12-.88 2.12H16l-4 4v3l-2-2-2 2v-3l-4-4v-3.12c0-1.1 1.34-1.66 2.12-.88l3.5 3.5" />
    </svg>
  );
}

export function IconCalendar({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

export function IconMapPin({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
    </svg>
  );
}

export function IconSparkles({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  );
}

export function IconClose({ size = 18, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function IconCheck({ size = 18, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export function IconSettings({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}

export function IconPlus({ size = 18, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export function IconLock({ size = 18, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
    </svg>
  );
}

