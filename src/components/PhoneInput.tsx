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
}

// EU member states
export const EU_COUNTRIES: CountryOption[] = [
  { code: "BG", name: "България", flag: "🇧🇬", dial: "+359" },
  { code: "AT", name: "Австрия", flag: "🇦🇹", dial: "+43" },
  { code: "BE", name: "Белгия", flag: "🇧🇪", dial: "+32" },
  { code: "HR", name: "Хърватия", flag: "🇭🇷", dial: "+385" },
  { code: "CY", name: "Кипър", flag: "🇨🇾", dial: "+357" },
  { code: "CZ", name: "Чехия", flag: "🇨🇿", dial: "+420" },
  { code: "DK", name: "Дания", flag: "🇩🇰", dial: "+45" },
  { code: "EE", name: "Естония", flag: "🇪🇪", dial: "+372" },
  { code: "FI", name: "Финландия", flag: "🇫🇮", dial: "+358" },
  { code: "FR", name: "Франция", flag: "🇫🇷", dial: "+33" },
  { code: "DE", name: "Германия", flag: "🇩🇪", dial: "+49" },
  { code: "GR", name: "Гърция", flag: "🇬🇷", dial: "+30" },
  { code: "HU", name: "Унгария", flag: "🇭🇺", dial: "+36" },
  { code: "IE", name: "Ирландия", flag: "🇮🇪", dial: "+353" },
  { code: "IT", name: "Италия", flag: "🇮🇹", dial: "+39" },
  { code: "LV", name: "Латвия", flag: "🇱🇻", dial: "+371" },
  { code: "LT", name: "Литва", flag: "🇱🇹", dial: "+370" },
  { code: "LU", name: "Люксембург", flag: "🇱🇺", dial: "+352" },
  { code: "MT", name: "Малта", flag: "🇲🇹", dial: "+356" },
  { code: "NL", name: "Нидерландия", flag: "🇳🇱", dial: "+31" },
  { code: "PL", name: "Полша", flag: "🇵🇱", dial: "+48" },
  { code: "PT", name: "Португалия", flag: "🇵🇹", dial: "+351" },
  { code: "RO", name: "Румъния", flag: "🇷🇴", dial: "+40" },
  { code: "SK", name: "Словакия", flag: "🇸🇰", dial: "+421" },
  { code: "SI", name: "Словения", flag: "🇸🇮", dial: "+386" },
  { code: "ES", name: "Испания", flag: "🇪🇸", dial: "+34" },
  { code: "SE", name: "Швеция", flag: "🇸🇪", dial: "+46" },
];

interface PhoneInputProps {
  id?: string;
  value: string; // full E.164-ish string, e.g. "+359881234567"
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PhoneInput({ id, value, onChange, placeholder }: PhoneInputProps) {
  // Detect current country from value, default Bulgaria
  const detected =
    EU_COUNTRIES.find((c) => value.startsWith(c.dial)) ?? EU_COUNTRIES[0];
  const [country, setCountry] = useState<CountryOption>(detected);
  const [open, setOpen] = useState(false);

  const local = value.startsWith(country.dial)
    ? value.slice(country.dial.length).replace(/^\s+/, "")
    : value.replace(/^\+\d+\s*/, "");

  const updateLocal = (next: string) => {
    const digits = next.replace(/[^\d\s]/g, "");
    onChange(`${country.dial}${digits ? " " + digits.trim() : ""}`);
  };

  const updateCountry = (c: CountryOption) => {
    setCountry(c);
    setOpen(false);
    onChange(`${c.dial}${local ? " " + local.trim() : ""}`);
  };

  return (
    <div className="mt-1.5 flex gap-2">
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
        inputMode="tel"
        value={local}
        onChange={(e) => updateLocal(e.target.value)}
        placeholder={placeholder ?? "88 123 4567"}
        className="flex-1"
      />
    </div>
  );
}
