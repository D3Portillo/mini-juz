import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type SelectElement = {
  value: string
  label: string
}

export default function MainSelect({
  children,
  value,
  options,
  showSelectedItem = true,
  ...props
}: Omit<Parameters<typeof Select>[0], "children"> & {
  options: SelectElement[]
  showSelectedItem?: boolean
  children: ((selected: SelectElement | null) => JSX.Element) | JSX.Element
}) {
  const selected = options.find((o) => o.value === value) || null
  return (
    <Select value={value} {...props}>
      <SelectTrigger asChild>
        {typeof children === "function" ? children(selected) : children}
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            className={cn(showSelectedItem || "[&_.CheckMark]:hidden pr-5")}
            key={`select-option-${option.value}-${option.label}`}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
