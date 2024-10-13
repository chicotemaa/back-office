// DatePickerField.tsx
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerFieldProps {
  label?: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, value, onChange }) => {
  return (
    <div className="datepicker-container">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <DatePicker
        selected={value}
        onChange={onChange}
        showTimeSelect // Habilita la selección de hora
        timeFormat="HH:mm" // Formato de la hora
        timeIntervals={15} // Intervalos de tiempo (por ejemplo, cada 15 minutos)
        dateFormat="yyyy-MM-dd HH:mm" // Formato de la fecha y hora
        className="rounded-md border border-gray-300 p-2"
        placeholderText="Seleccione fecha y hora"
      />
    </div>
  );
};

export default DatePickerField;
