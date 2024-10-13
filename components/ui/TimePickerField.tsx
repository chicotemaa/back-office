import { TimePicker } from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

interface TimePickerFieldProps {
  label?: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
}

const TimePickerField: React.FC<TimePickerFieldProps> = ({ label, value, onChange }) => {
  return (
    <div className="timepicker-container">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <TimePicker
        onChange={(val) => onChange(val ? new Date(val) : null)}
        value={value ? value.toTimeString().slice(0, 5) : ''}
        format="HH:mm"
        clearIcon={null}
        className="rounded-md border border-gray-300 p-2"
      />
    </div>
  );
};

export default TimePickerField;