'use client';

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
    setNewEmpleado((prev) => ({ ...prev, [name]: value }));
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
            confirmButton: 'bg-green-500 text-white px-4 py-2 rounded-md', // Estilo personalizado para el botón OK
          }
        });
      } catch (error) {
        console.error('Error al actualizar el empleado: ', error);
        Swal.fire('Error', 'Hubo un problema al guardar los cambios.', 'error');
        Swal.fire({
          title: 'ÉxiErrorto',
          text: 'Hubo un problema al guardar los cambios.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ff85d6',
        });
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
              confirmButton: 'bg-green-500 text-white px-4 py-2 rounded-md', // Estilo personalizado para el botón OK
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
      francos: [], // Días libres vacíos
    });
  };
  

  const filteredEmpleados = empleados.filter((empleado) =>
    empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Empleados</h1>
      <div className="mb-4">
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
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditEmpleado(empleado)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteEmpleado(empleado.id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Button className="mt-4" onClick={() => { 
        resetNewEmpleado(); // Limpia los campos del nuevo empleado
        setIsEditing(false); // Asegúrate de que no estás en modo edición
        setModalOpen(true); // Abre el modal
      }}>
        Agregar Empleado
      </Button>


      {/* Modal Integrado */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Empleado' : 'Agregar Empleado'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Edita los detalles del empleado.' : 'Agrega un nuevo empleado al sistema.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nombre"
                name="nombre"
                value={newEmpleado.nombre}
                onChange={handleChange}
                className="mb-2"
              />
              <Input
                placeholder="Puesto"
                name="puesto"
                value={newEmpleado.puesto}
                onChange={handleChange}
                className="mb-2"
              />
              <Input
                placeholder="Email"
                name="email"
                value={newEmpleado.email}
                onChange={handleChange}
                className="mb-2"
              />
              <Input
                placeholder="Teléfono"
                name="telefono"
                value={newEmpleado.telefono}
                onChange={handleChange}
                className="mb-2"
              />

              {/* Selección de horario general */}
              <div className="flex space-x-4">
                <Input
                  type="time"
                  name="desde"
                  value={newEmpleado.horario.desde}
                  onChange={(e) => setNewEmpleado((prev) => ({
                    ...prev,
                    horario: { ...prev.horario, desde: e.target.value },
                  }))}
                  className="w-24"
                />
                <span>-</span>
                <Input
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

              {/* Selección de días libres (francos) */}
              <div>
                <label>Días libres (francos):</label>
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
