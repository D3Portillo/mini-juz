import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

type SelectElement = {
  value: string
  label: string
}

export default function MainSelect({
  children,
  value,
  options,
  ...props
}: Omit<Parameters<typeof Select>[0], "children"> & {
  options: SelectElement[]
  children: (selected: SelectElement | null) => JSX.Element
}) {
  const selected = options.find((o) => o.value === value) || null
  return (
    <Select value={value} {...props}>
      <SelectTrigger asChild>{children(selected)}</SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
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
