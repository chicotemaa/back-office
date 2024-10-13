import React from 'react'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/button';

interface Turno {
    id: string;
    fecha: string;
    cliente: string;
    empleado: string;
    servicio: string;
    cobrado: boolean;
    monto: number;
    cajaId?: string; // Agregamos el campo para la caja
  }

interface Cliente {
  id: string;
  nombre: string;
}

interface Empleado {
  id: string;
  nombre: string;
}

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
}
interface Caja {
  id: string;
  nombre: string;
}

interface TurnoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  newTurno: Turno;
  setNewTurno: React.Dispatch<React.SetStateAction<Turno>>;
  clientes: Cliente[];
  empleados: Empleado[];
  servicios: Servicio[];
  onSave: () => void;
}

const TurnoFormModal: React.FC<TurnoFormModalProps> = ({
  isOpen,
  onClose,
  isEditing,
  newTurno,
  setNewTurno,
  clientes,
  empleados,
  servicios,
  onSave,
}) => {

  // Función para manejar el cambio del servicio y actualizar el precio
  const handleServiceChange = (value: string) => {
    const selectedService = servicios.find((servicio) => servicio.nombre === value);
    console.log("entro",selectedService);
    
    if (selectedService) {
      setNewTurno((prev) => ({
        ...prev,
        servicio: value,
        monto: selectedService.precio // Actualizamos tanto el servicio como el monto
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Turno' : 'Agregar Turno'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edita los detalles del turno.' : 'Agrega un nuevo turno al sistema.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select onValueChange={(value) => setNewTurno((prev) => ({ ...prev, cliente: value }))}>
            <SelectTrigger>
              <SelectValue placeholder={newTurno.cliente || "Seleccionar Cliente"} />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.nombre}>
                  {cliente.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setNewTurno((prev) => ({ ...prev, empleado: value }))}>
            <SelectTrigger>
              <SelectValue placeholder={newTurno.empleado || "Seleccionar Empleado"} />
            </SelectTrigger>
            <SelectContent>
              {empleados.map((empleado) => (
                <SelectItem key={empleado.id} value={empleado.nombre}>
                  {empleado.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Aquí corregimos el onValueChange para usar handleServiceChange */}
          <Select onValueChange={handleServiceChange}>
            <SelectTrigger>
              <SelectValue placeholder={newTurno.servicio || "Seleccionar Servicio"} />
            </SelectTrigger>
            <SelectContent>
              {servicios.map((servicio) => (
                <SelectItem key={servicio.id} value={servicio.nombre}>
                  {servicio.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Campo para la fecha y hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora del Turno</label>
            <DatePicker
              selected={newTurno.fecha ? new Date(newTurno.fecha) : null}
              onChange={(date: Date | null) => setNewTurno((prev: any) => ({ ...prev, fecha: date ? date.toISOString() : null }))}
              showTimeSelect
              dateFormat="Pp"
              className="rounded-md border border-gray-300 p-2"
            />
          </div>
          {/* Campo para el monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input 
              type="number"
              value={newTurno.monto || 0}
              disabled
              className="rounded-md border border-gray-300 p-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            {isEditing ? 'Guardar Cambios' : 'Agregar Turno'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TurnoFormModal;
