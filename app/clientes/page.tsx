'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Swal from "sweetalert2";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCliente, setNewCliente] = useState({
    nombre: '',
    email: '',
    telefono: '',
  });

  // Obtener clientes de Firebase
  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      try {
        const clientesSnapshot = await getDocs(collection(db, "clientes"));
        const clientesData = clientesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Cliente[];
        setClientes(clientesData);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setNewCliente(cliente);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (selectedCliente) {
      setLoading(true);
      try {
        const clienteRef = doc(db, "clientes", selectedCliente.id);
        await updateDoc(clienteRef, newCliente);

        const updatedClientes = clientes.map((cli) =>
          cli.id === selectedCliente.id ? { ...cli, ...newCliente } : cli
        );
        setClientes(updatedClientes);
        setModalOpen(false);
        setIsEditing(false);
      } catch (error) {
        console.error("Error al actualizar el cliente: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddCliente = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "clientes"), newCliente);
      const newClient = { id: docRef.id, ...newCliente };
      setClientes([...clientes, newClient]);
      setModalOpen(false);
    } catch (error) {
      console.error("Error al agregar el cliente: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCliente = (clienteId: string) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          // Eliminar el cliente de Firebase
          await deleteDoc(doc(db, "clientes", clienteId));

          // Actualizar el estado local para remover el cliente eliminado
          setClientes((prevClientes) => prevClientes.filter((cli) => cli.id !== clienteId));

          Swal.fire("Eliminado!", "El cliente ha sido eliminado.", "success");
        } catch (error) {
          console.error("Error al eliminar el cliente: ", error);
          Swal.fire("Error!", "Hubo un problema al eliminar el cliente.", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Filtrar los clientes por el nombre ingresado en el searchTerm
  const filteredClientes = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes</h1>
      <div className="mb-4">
        <Input
          placeholder="Buscar cliente..."
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
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nombre}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefono}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditCliente(cliente)}>Editar</Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteCliente(cliente.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Button className="mt-4" onClick={() => setModalOpen(true)}>Agregar Cliente</Button>

      {/* Modal Integrado */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Cliente" : "Agregar Cliente"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Edita los detalles del cliente." : "Agrega un nuevo cliente al sistema."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nombre"
                name="nombre"
                value={newCliente.nombre}
                onChange={handleChange}
                className="mb-2"
              />
              <Input
                placeholder="Email"
                name="email"
                value={newCliente.email}
                onChange={handleChange}
                className="mb-2"
              />
              <Input
                placeholder="Teléfono"
                name="telefono"
                value={newCliente.telefono}
                onChange={handleChange}
                className="mb-2"
              />
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={isEditing ? handleSaveChanges : handleAddCliente}>
                {isEditing ? "Guardar Cambios" : "Agregar Cliente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
