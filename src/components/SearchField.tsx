import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: "line" | "box";
};

export default function SearchField({
  value,
  onChange,
  placeholder = "Cari nama",
  className = "",
  variant = "line",
}: Props) {
  return (
    <div className={`group relative shrink-0 ${className}`}>
      <Search
        size={16}
        strokeWidth={1.75}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-pink"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={variant === "box" ? "input-field has-icon" : "search-line"}
      />
    </div>
  );
}
