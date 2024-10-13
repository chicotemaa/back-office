import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SelectFieldProps {
  label: string;
  placeholder: string;
  options: { id: string; nombre: string }[];
  onValueChange: (value: string) => void;
}

export default function SelectField({ label, placeholder, options, onValueChange }: SelectFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.nombre}>
              {option.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}



