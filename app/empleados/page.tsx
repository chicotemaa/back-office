"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Swal from 'sweetalert2';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Checkbox } from '@/components/ui/checkbox';

interface Empleado {
  id: string;
  nombre: string;
  puesto: string;
  email: string;
  telefono: string;
  horario: {
    desde: string;
    hasta: string;
  };
  francos: string[]; // Días libres
  porcentajeTrabajo: number;
}

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmpleado, setNewEmpleado] = useState({
    nombre: '',
    puesto: '',
    email: '',
    telefono: '',
    horario: { desde: '', hasta: '' }, // Horario general
    francos: [] as string[], // Días libres (más de uno permitido)
    porcentajeTrabajo: 0,
  });

  // Obtener empleados de Firebase
  useEffect(() => {
    const fetchEmpleados = async () => {
      setLoading(true);
      try {
        const empleadosSnapshot = await getDocs(collection(db, 'empleados'));
        const empleadosData = empleadosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Empleado[];
        setEmpleados(empleadosData);
      } catch (error) {
        console.error('Error al obtener empleados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmpleados();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmpleado((prev) => ({
      ...prev,
      [name]: name === 'porcentajeTrabajo' ? parseFloat(value) : value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckboxChange = (dia: string) => {
    const selected = newEmpleado.francos.includes(dia);
    if (selected) {
      setNewEmpleado((prev) => ({
        ...prev,
        francos: prev.francos.filter((f) => f !== dia),
      }));
    } else {
      setNewEmpleado((prev) => ({
        ...prev,
        francos: [...prev.francos, dia],
      }));
    }
  };

  const handleEditEmpleado = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setNewEmpleado(empleado);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (selectedEmpleado) {
      setLoading(true);
      try {
        const empleadoRef = doc(db, 'empleados', selectedEmpleado.id);
        await updateDoc(empleadoRef, newEmpleado);

        const updatedEmpleados = empleados.map((emp) =>
          emp.id === selectedEmpleado.id ? { ...emp, ...newEmpleado } : emp
        );
        setEmpleados(updatedEmpleados);
        setModalOpen(false);
        setIsEditing(false);
        Swal.fire({
          title: 'Éxito',
          text: 'Los cambios han sido guardados.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6',
          customClass: {
            confirmButton: 'bg-green-500 text-white px-4 py-2 rounded-md',
          }
        });
      } catch (error) {
        console.error('Error al actualizar el empleado: ', error);
        Swal.fire('Error', 'Hubo un problema al guardar los cambios.', 'error');
      } finally {
        setLoading(false);
      }
    }
    setIsEditing(false);
  };

  const handleAddEmpleado = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'empleados'), newEmpleado);
      const newEmployee = { id: docRef.id, ...newEmpleado };
      setEmpleados([...empleados, newEmployee]);
      setModalOpen(false);
      Swal.fire('Éxito', 'Empleado agregado correctamente.', 'success');
    } catch (error) {
      console.error('Error al agregar el empleado: ', error);
      Swal.fire('Error', 'Hubo un problema al agregar el empleado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmpleado = (empleadoId: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await deleteDoc(doc(db, 'empleados', empleadoId));

          setEmpleados((prevEmpleados) => prevEmpleados.filter((emp) => emp.id !== empleadoId));

          Swal.fire({
            title: 'Eliminado!',
            text: 'El empleado ha sido eliminado.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
            customClass: {
              confirmButton: 'bg-green-500 text-white px-4 py-2 rounded-md',
            }
          });
        } catch (error) {
          console.error('Error al eliminar el empleado: ', error);
          Swal.fire('Error!', 'Hubo un problema al eliminar el empleado.', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const resetNewEmpleado = () => {
    setNewEmpleado({
      nombre: '',
      puesto: '',
      email: '',
      telefono: '',
      horario: { desde: '', hasta: '' },
      francos: [],
      porcentajeTrabajo: 0
    });
  };

  const filteredEmpleados = empleados.filter((empleado) =>
    empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Empleados</h1>
      <div className="flex items-center justify-between mb-4">
        <Button
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => { 
            resetNewEmpleado();
            setIsEditing(false);
            setModalOpen(true);
          }}
        >
          Agregar Empleado
        </Button>
        <Input
          placeholder="Buscar empleado..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Puesto</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Francos</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmpleados.map((empleado) => (
              <TableRow key={empleado.id}>
                <TableCell>{empleado.nombre}</TableCell>
                <TableCell>{empleado.puesto}</TableCell>
                <TableCell>{empleado.email}</TableCell>
                <TableCell>{empleado.telefono}</TableCell>
                <TableCell>{empleado.francos?.join(', ') || 'Sin franco'}</TableCell>
                <TableCell>
                  {empleado.horario.desde} - {empleado.horario.hasta}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-yellow-500 text-white hover:bg-yellow-600 mr-2"
                    onClick={() => handleEditEmpleado(empleado)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={() => handleDeleteEmpleado(empleado.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal Integrado */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edita los detalles del empleado.' : 'Agrega un nuevo empleado al sistema.'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <Input
                  id="nombre"
                  placeholder="Nombre"
                  name="nombre"
                  value={newEmpleado.nombre}
                  onChange={handleChange}
                  className="mb-2"
                />
              </div>

              <div>
                <label htmlFor="puesto" className="block text-sm font-medium text-gray-700">
                  Puesto
                </label>
                <Input
                  id="puesto"
                  placeholder="Puesto"
                  name="puesto"
                  value={newEmpleado.puesto}
                  onChange={handleChange}
                  className="mb-2"
                />
              </div>

              <div>
                <label htmlFor="porcentajeTrabajo" className="block text-sm font-medium text-gray-700">
                  Porcentaje de trabajo
                </label>
                <Input
                  id="porcentajeTrabajo"
                  type="number"
                  placeholder="Porcentaje de trabajo"
                  name="porcentajeTrabajo"
                  value={newEmpleado.porcentajeTrabajo}
                  onChange={handleChange}
                  className="mb-2"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  placeholder="Email"
                  name="email"
                  value={newEmpleado.email}
                  onChange={handleChange}
                  className="mb-2"
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <Input
                  id="telefono"
                  placeholder="Teléfono"
                  name="telefono"
                  value={newEmpleado.telefono}
                  onChange={handleChange}
                  className="mb-2"
                />
              </div>

              {/* Selección de horario general */}
              <div className="flex space-x-4">
                <div>
                  <label htmlFor="desde" className="block text-sm font-medium text-gray-700">
                    Horario desde
                  </label>
                  <Input
                    id="desde"
                    type="time"
                    name="desde"
                    value={newEmpleado.horario.desde}
                    onChange={(e) => setNewEmpleado((prev) => ({
                      ...prev,
                      horario: { ...prev.horario, desde: e.target.value },
                    }))}
                    className="w-24"
                  />
                </div>
                <span>-</span>
                <div>
                  <label htmlFor="hasta" className="block text-sm font-medium text-gray-700">
                    Horario hasta
                  </label>
                  <Input
                    id="hasta"
                    type="time"
                    name="hasta"
                    value={newEmpleado.horario.hasta}
                    onChange={(e) => setNewEmpleado((prev) => ({
                      ...prev,
                      horario: { ...prev.horario, hasta: e.target.value },
                    }))}
                    className="w-24"
                  />
                </div>
              </div>

              {/* Selección de días libres (francos) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Días libres (francos)
                </label>
                {diasSemana.map((dia) => (
                  <div key={dia} className="flex items-center space-x-2">
                    <Checkbox
                      checked={newEmpleado.francos.includes(dia)}
                      onCheckedChange={() => handleCheckboxChange(dia)}
                    />
                    <label>{dia}</label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={isEditing ? handleSaveChanges : handleAddEmpleado} 
                disabled={loading}  // Deshabilitar el botón cuando está cargando
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                {loading ? 'Procesando...' : isEditing ? 'Guardar Cambios' : 'Agregar Empleado'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

