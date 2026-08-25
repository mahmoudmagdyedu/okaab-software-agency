import { cn } from "../lib/utils";
import { withBasePath } from "../lib/base-path";

type BrandLogoProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, inverse = false, className }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "brand-mark flex shrink-0 items-center justify-center overflow-hidden",
          compact ? "h-9 w-9" : "h-11 w-11",
        )}
      >
        <img
          src={withBasePath("/brand/bun-al-deerah-mark.png")}
          alt=""
          className="h-[88%] w-[88%] object-contain"
        />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span
            className={cn(
              "brand-heading block text-[18px] font-semibold leading-none",
              inverse ? "text-[#f6f0df]" : "text-text-primary",
            )}
          >
            بُنّ الديرة
          </span>
          <span
            className={cn(
              "mt-1.5 block text-[9px] font-semibold tracking-[0.28em]",
              inverse ? "text-[#9db6aa]" : "text-text-muted",
            )}
            dir="ltr"
          >
            COFFEE · POS
          </span>
        </span>
      )}
    </span>
  );
}
