export interface DraftLink {
  platform: string;
  url: string;
  label: string;
  order: number;
}

export const BLANK_DRAFT: DraftLink = {
  platform: "facebook",
  url: "",
  label: "",
  order: 0,
};
