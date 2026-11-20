import { RivalryTier } from "../../api-feature/types";

export interface RivalryTierMeta {
    color: string;
    icon: string;
    glow: string;
    label: string;
    matchBannerLabel: string;
}

export const RIVALRY_TIER_META: Record<RivalryTier, RivalryTierMeta> = {
    rivals: {
        color: "#00ffe1",
        icon: "⚔️",
        glow: "0 0 12px rgba(0,255,225,0.5)",

    },
    arch: {
        color: "#ff2d6e",
        icon: "💀",
        glow: "0 0 14px rgba(255,45,110,0.6)",
        label: "Arch Rivals",
        matchBannerLabel: "ARCH-RIVAL SHOWDOWN",
    },
};
