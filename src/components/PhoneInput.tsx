import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  dial: string;
  /** Minimum number of national digits (excluding leading 0 / country code) */
  minDigits: number;
  /** Maximum number of national digits */
  maxDigits: number;
}

// EU member states with expected national-number lengths
export const EU_COUNTRIES: CountryOption[] = [
  { code: "BG", name: "България", flag: "🇧🇬", dial: "+359", minDigits: 9, maxDigits: 9 },
  { code: "AT", name: "Австрия", flag: "🇦🇹", dial: "+43", minDigits: 10, maxDigits: 11 },
  { code: "BE", name: "Белгия", flag: "🇧🇪", dial: "+32", minDigits: 9, maxDigits: 9 },
  { code: "HR", name: "Хърватия", flag: "🇭🇷", dial: "+385", minDigits: 8, maxDigits: 9 },
  { code: "CY", name: "Кипър", flag: "🇨🇾", dial: "+357", minDigits: 8, maxDigits: 8 },
  { code: "CZ", name: "Чехия", flag: "🇨🇿", dial: "+420", minDigits: 9, maxDigits: 9 },
  { code: "DK", name: "Дания", flag: "🇩🇰", dial: "+45", minDigits: 8, maxDigits: 8 },
  { code: "EE", name: "Естония", flag: "🇪🇪", dial: "+372", minDigits: 7, maxDigits: 8 },
  { code: "FI", name: "Финландия", flag: "🇫🇮", dial: "+358", minDigits: 9, maxDigits: 10 },
  { code: "FR", name: "Франция", flag: "🇫🇷", dial: "+33", minDigits: 9, maxDigits: 9 },
  { code: "DE", name: "Германия", flag: "🇩🇪", dial: "+49", minDigits: 10, maxDigits: 11 },
  { code: "GR", name: "Гърция", flag: "🇬🇷", dial: "+30", minDigits: 10, maxDigits: 10 },
  { code: "HU", name: "Унгария", flag: "🇭🇺", dial: "+36", minDigits: 8, maxDigits: 9 },
  { code: "IE", name: "Ирландия", flag: "🇮🇪", dial: "+353", minDigits: 9, maxDigits: 9 },
  { code: "IT", name: "Италия", flag: "🇮🇹", dial: "+39", minDigits: 9, maxDigits: 10 },
  { code: "LV", name: "Латвия", flag: "🇱🇻", dial: "+371", minDigits: 8, maxDigits: 8 },
  { code: "LT", name: "Литва", flag: "🇱🇹", dial: "+370", minDigits: 8, maxDigits: 8 },
  { code: "LU", name: "Люксембург", flag: "🇱🇺", dial: "+352", minDigits: 8, maxDigits: 9 },
  { code: "MT", name: "Малта", flag: "🇲🇹", dial: "+356", minDigits: 8, maxDigits: 8 },
  { code: "NL", name: "Нидерландия", flag: "🇳🇱", dial: "+31", minDigits: 9, maxDigits: 9 },
  { code: "PL", name: "Полша", flag: "🇵🇱", dial: "+48", minDigits: 9, maxDigits: 9 },
  { code: "PT", name: "Португалия", flag: "🇵🇹", dial: "+351", minDigits: 9, maxDigits: 9 },
  { code: "RO", name: "Румъния", flag: "🇷🇴", dial: "+40", minDigits: 9, maxDigits: 9 },
  { code: "SK", name: "Словакия", flag: "🇸🇰", dial: "+421", minDigits: 9, maxDigits: 9 },
  { code: "SI", name: "Словения", flag: "🇸🇮", dial: "+386", minDigits: 8, maxDigits: 8 },
  { code: "ES", name: "Испания", flag: "🇪🇸", dial: "+34", minDigits: 9, maxDigits: 9 },
  { code: "SE", name: "Швеция", flag: "🇸🇪", dial: "+46", minDigits: 7, maxDigits: 9 },
];

/**
 * Validate a phone string produced by PhoneInput.
 * Returns an error message in Bulgarian, or null when valid.
 */
export function validatePhoneNumber(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("+")) return "Телефонът трябва да започва с код на държава";
  const country = EU_COUNTRIES.find((c) => trimmed.startsWith(c.dial));
  if (!country) return "Неподдържан код на държава";
  const digits = trimmed.slice(country.dial.length).replace(/\D/g, "");
  if (digits.length === 0) return "Моля въведете телефонен номер";
  if (digits.length < country.minDigits) {
    return `Номерът за ${country.name} трябва да е ${
      country.minDigits === country.maxDigits
        ? `${country.minDigits} цифри`
        : `${country.minDigits}–${country.maxDigits} цифри`
    } (въведени ${digits.length})`;
  }
  if (digits.length > country.maxDigits) {
    return `Номерът за ${country.name} е твърде дълъг (макс. ${country.maxDigits} цифри)`;
  }
  // Reject obvious junk like all same digit
  if (/^(\d)\1+$/.test(digits)) return "Невалиден телефонен номер";
  return null;
}

interface PhoneInputProps {
  id?: string;
  value: string; // e.g. "+359881234567"
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PhoneInput({ id, value, onChange, placeholder }: PhoneInputProps) {
  const detected =
    EU_COUNTRIES.find((c) => value.startsWith(c.dial)) ?? EU_COUNTRIES[0];
  const [country, setCountry] = useState<CountryOption>(detected);
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const localDigits = (value.startsWith(country.dial)
    ? value.slice(country.dial.length)
    : value.replace(/^\+\d+/, "")
  ).replace(/\D/g, "");

  const updateLocal = (next: string) => {
    let digits = next.replace(/\D/g, "");
    if (digits.length > country.maxDigits) digits = digits.slice(0, country.maxDigits);
    onChange(`${country.dial}${digits}`);
  };

  const updateCountry = (c: CountryOption) => {
    setCountry(c);
    setOpen(false);
    const trimmed = localDigits.slice(0, c.maxDigits);
    onChange(`${c.dial}${trimmed}`);
  };

  const tooShort = localDigits.length > 0 && localDigits.length < country.minDigits;
  const showError = touched && (localDigits.length === 0 || tooShort);
  const expected =
    country.minDigits === country.maxDigits
      ? `${country.minDigits}`
      : `${country.minDigits}–${country.maxDigits}`;

  return (
    <div className="mt-1.5">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0 gap-1 px-2.5 font-normal"
            >
              <span className="text-base leading-none">{country.flag}</span>
              <span className="text-sm">{country.dial}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-1 max-h-72 overflow-y-auto" align="start">
            {EU_COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => updateCountry(c)}
                className={cn(
                  "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent text-left",
                  c.code === country.code && "bg-accent"
                )}
              >
                <span className="text-base">{c.flag}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-muted-foreground text-xs">{c.dial}</span>
                {c.code === country.code && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={localDigits}
          onChange={(e) => updateLocal(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder ?? "881234567"}
          maxLength={country.maxDigits}
          className={cn("flex-1", showError && "border-destructive focus-visible:ring-destructive")}
          aria-invalid={showError || undefined}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className={cn("text-muted-foreground", showError && "text-destructive")}>
          {showError
            ? localDigits.length === 0
              ? "Моля въведете телефонен номер"
              : `Очаквани ${expected} цифри за ${country.name}`
            : `Само цифри · ${expected} за ${country.name}`}
        </span>
        <span
          className={cn(
            "tabular-nums text-muted-foreground",
            tooShort && "text-destructive",
            !tooShort && localDigits.length === country.maxDigits && "text-emerald-500"
          )}
        >
          {localDigits.length}/{country.maxDigits}
        </span>
      </div>
    </div>
  );
}
