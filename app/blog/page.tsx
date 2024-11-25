"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase"; // Importa Firestore y Storage
import Swal from "sweetalert2";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";  // Import axios

// Definición de la interfaz para Blog
interface Blog {
  id: string;
  title: string;
  description: string;
  publicationDate: string; // Fecha de publicación
  isVisible: boolean;      // Visibilidad
  imageUrl?: string;       // URL de la imagen subida
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBlog, setNewBlog] = useState<Blog | any>({
    title: '',
    description: '',
    publicationDate: '',
    isVisible: true,
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null); // Imagen seleccionada

  // Obtener blogs de Firebase
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const blogsSnapshot = await getDocs(collection(db, "blogs"));
        const blogsData = blogsSnapshot.docs.map((doc) => {
          const data = doc.data();
  
          return {
            id: doc.id,
            title: data.title || "", // Asegurarse de que las propiedades existen
            description: data.description || "",
            publicationDate: data.publicationDate || "", // Mantener como string para cumplir con el tipo Blog
            isVisible: data.isVisible ?? true, // Asegurar que `isVisible` tiene un valor booleano
            imageUrl: data.imageUrl || "", // Asegurar que `imageUrl` tiene un valor string o vacío
          };
        }) as Blog[];
  
        // Ordenar los blogs por la fecha de publicación de más nuevo a más viejo
        blogsData.sort((a, b) => Date.parse(b.publicationDate) - Date.parse(a.publicationDate));
  
        setBlogs(blogsData);
      } catch (error) {
        console.error("Error al obtener blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);
  
  
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | any) => {
    const { name, value, type, checked } = e.target;
    setNewBlog((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]); // Guardar el archivo seleccionado
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return "";
    const storageRef = ref(storage, `blogs/${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef); // Obtener la URL de descarga
  };

  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setNewBlog(blog);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (selectedBlog) {
      setLoading(true);
      try {
        const imageUrl = imageFile ? await uploadImage() : selectedBlog.imageUrl;
        const updatedBlog = { ...newBlog, imageUrl };

        const blogRef = doc(db, "blogs", selectedBlog.id);
        await updateDoc(blogRef, updatedBlog);

        const updatedBlogs = blogs.map((b) =>
          b.id === selectedBlog.id ? { ...b, ...updatedBlog } : b
        );
        setBlogs(updatedBlogs);
        setModalOpen(false);
        setIsEditing(false);
      } catch (error) {
        console.error("Error al actualizar el blog: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddBlog = async () => {
    setLoading(true);
    try {
      const imageUrl = imageFile ? await uploadImage() : "";
      const docRef = await addDoc(collection(db, "blogs"), { ...newBlog, imageUrl });
      const newCreatedBlog = { id: docRef.id, ...newBlog, imageUrl };
      setBlogs([...blogs, newCreatedBlog]);
      setModalOpen(false);
    } catch (error) {
      console.error("Error al agregar el blog: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = (blogId: string) => {
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
          await deleteDoc(doc(db, "blogs", blogId));
          setBlogs((prevBlogs) => prevBlogs.filter((b) => b.id !== blogId));
          Swal.fire("Eliminado!", "El blog ha sido eliminado.", "success");
        } catch (error) {
          console.error("Error al eliminar el blog: ", error);
          Swal.fire("Error!", "Hubo un problema al eliminar el blog.", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const generateContentWithAI = async () => {
    if (newBlog.title.trim() === "") {
      Swal.fire("Error!", "El título no puede estar vacío.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/generate', {
        title: newBlog.title
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status !== 200) {
        throw new Error('Error al generar el contenido con IA');
      }

      setNewBlog((prev: any) => ({
        ...prev,
        description: response.data.content
      }));
    } catch (error) {
      console.error("Error al generar contenido con IA: ", error);
      Swal.fire("Error!", "Hubo un problema al generar el contenido con IA.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Blogs</h1>

      <Button className="mb-6 bg-blue-600 text-white hover:bg-blue-700" onClick={() => setModalOpen(true)}>
        Agregar Blog
      </Button>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Fecha de Publicación</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Imagen</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.description}</TableCell>
                  <TableCell>{blog.publicationDate}</TableCell>
                  <TableCell>{blog.isVisible ? "Sí" : "No"}</TableCell>
                  <TableCell>
                  {blog.imageUrl ? (
                    <Image src={blog.imageUrl} alt={blog.title} width={50} height={50} />
                    ) : "No disponible"}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2 bg-yellow-500 text-white hover:bg-yellow-600" onClick={() => handleEditBlog(blog)}>Editar</Button>
                    <Button variant="outline" size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={() => handleDeleteBlog(blog.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No se encontraron blogs
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Modal para agregar/editar blog */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>{isEditing ? "Editar Blog" : "Agregar Blog"}</DialogTitle>
                <DialogDescription>
                {isEditing ? "Edita los detalles del blog." : "Agrega un nuevo blog al sistema."}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <Input
                placeholder="Título"
                name="title"
                value={newBlog.title}
                onChange={handleChange}
                className="mb-2"
                />
                <Button variant="outline" onClick={generateContentWithAI} className="mb-2 bg-green-500 text-white hover:bg-green-600">
                  Generar con IA
                </Button>
                <Textarea
                placeholder="Descripción"
                name="description"
                value={newBlog.description}
                onChange={handleChange}
                className="mb-4"
                />
                <Input
                type="date"
                placeholder="Fecha de Publicación"
                name="publicationDate"
                value={newBlog.publicationDate}
                onChange={handleChange}
                className="mb-2"
                />
                <label className="flex items-center">
                <input
                    type="checkbox"
                    name="isVisible"
                    checked={newBlog.isVisible}
                    onChange={handleChange}
                    className="mr-2"
                />
                ¿Visible?
                </label>
                <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-2"
                />
            </div>
            <DialogFooter>
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
                </Button>
                <Button onClick={isEditing ? handleSaveChanges : handleAddBlog} className="bg-blue-600 text-white hover:bg-blue-700">
                {isEditing ? "Guardar Cambios" : "Agregar Blog"}
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
        )}
    </div>
  );
}
