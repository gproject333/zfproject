import type { CSSProperties, ReactNode } from "react";

export type LoginVariant = "student" | "admin" | "sponsor";

export interface LoginVariantConfig {
  theme: "light" | "dark";
  redirectTo: string;

  brand: {
    icon: ReactNode;
    iconBoxStyle?: CSSProperties;
    iconBoxClassName?: string;
    title: string;
    subtitle: string;
    subtitleColor?: string;
    subtitleClassName?: string;
    titleColor?: string;
  };

  pageStyle?: CSSProperties;
  pageClassName?: string;
  decorations: ReactNode;

  cardStyle?: CSSProperties;
  cardClassName?: string;
  cardBorderStyle?: CSSProperties;
  titleBarLabel: string;
  titleBarLabelColor?: string;
  titleBarDots: Array<{ background: string; border?: string }>;

  cardSubtitle?: string;

  inputStyle?: CSSProperties;
  inputClassName?: string;
  inputIconColor?: string;
  labelClassName?: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  floatLabelBg: string;
  floatLabelRestColor: string;
  floatLabelActiveColor: string;

  submitButtonStyle?: CSSProperties;
  submitButtonClassName?: string;
  submitText: string;
  submitHoverShadow?: { from: string; to: string };

  footerNode?: ReactNode;
}
