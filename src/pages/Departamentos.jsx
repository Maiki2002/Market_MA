import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import DepartmentList from "../components/departamentos/DepartmentList";
import DepartmentActions from "../components/departamentos/DepartmentActions";
import CreateDepartmentModal from "../components/departamentos/CreateDepartmentModal";
import DeleteDepartmentModal from "../components/departamentos/DeleteDepartmentModal";

function parseDepartmentKey(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed;
}

export default function Departamentos() {
  const [dataDepartamentos, setDataDepartamentos] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [claveDepto, setClaveDepto] = useState("");
  const [nombre, setNombre] = useState("");
  const [responsable, setResponsable] = useState("");
  const [keyToDelete, setKeyToDelete] = useState("");
  const [isCheckingDelete, setIsCheckingDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  useEffect(() => {
    getDataDepartamentos();
  }, []);

  async function getDataDepartamentos() {
    const { data } = await supabase
      .from("departamentos")
      .select()
      .order("claveDepto", { ascending: true });

    setDataDepartamentos(data ?? []);
  }

  function openCreateModal() {
    setCreateErrorMessage("");
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setClaveDepto("");
    setNombre("");
    setResponsable("");
    setCreateErrorMessage("");
  }

  function openDeleteModal() {
    setDeleteErrorMessage("");
    setDepartmentToDelete(null);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    setKeyToDelete("");
    setDepartmentToDelete(null);
    setDeleteErrorMessage("");
  }

  function handleDeleteKeyChange(value) {
    setKeyToDelete(value);
    setDepartmentToDelete(null);
    setDeleteErrorMessage("");
  }

  async function insertDataDepartamentos() {
    if (!claveDepto.trim() || !nombre.trim() || !responsable.trim()) {
      setCreateErrorMessage("Completa los tres campos.");
      return;
    }

    setIsSaving(true);
    setCreateErrorMessage("");

    const { error } = await supabase
      .from("departamentos")
      .insert({
        claveDepto: claveDepto.trim(),
        nombre: nombre.trim(),
        responsable: responsable.trim(),
      });

    setIsSaving(false);

    if (error) {
      setCreateErrorMessage("No se pudo guardar el departamento.");
      return;
    }

    await getDataDepartamentos();
    closeCreateModal();
  }

  async function verifyDepartmentToDelete() {
    const parsedKey = parseDepartmentKey(keyToDelete);
    if (parsedKey === null) {
      setDeleteErrorMessage("Clave invalida.");
      setDepartmentToDelete(null);
      return;
    }

    setIsCheckingDelete(true);
    setDeleteErrorMessage("");
    setDepartmentToDelete(null);

    const { data, error } = await supabase
      .from("departamentos")
      .select("*")
      .eq("claveDepto", parsedKey)
      .maybeSingle();

    setIsCheckingDelete(false);

    if (error) {
      setDeleteErrorMessage("No se pudo validar el departamento.");
      return;
    }

    if (!data) {
      setDeleteErrorMessage("No existe un departamento con esa clave.");
      return;
    }

    setDepartmentToDelete(data);
  }

  async function deleteDataDepartamentos() {
    if (!departmentToDelete) {
      setDeleteErrorMessage("Primero verifica la clave del departamento.");
      return;
    }

    setIsSaving(true);
    setDeleteErrorMessage("");

    const { error } = await supabase
      .from("departamentos")
      .delete()
      .eq("claveDepto", departmentToDelete.claveDepto);

    setIsSaving(false);

    if (error) {
      setDeleteErrorMessage("No se pudo borrar el departamento.");
      return;
    }

    await getDataDepartamentos();
    closeDeleteModal();
  }

  return (
    <div className="products-layout">
      <DepartmentList departments={dataDepartamentos} />

      <DepartmentActions
        onOpenCreate={openCreateModal}
        onOpenDelete={openDeleteModal}
        disabled={isSaving}
      />

      <CreateDepartmentModal
        isOpen={isCreateModalOpen}
        claveDepto={claveDepto}
        nombre={nombre}
        responsable={responsable}
        errorMessage={createErrorMessage}
        isSaving={isSaving}
        onChangeClaveDepto={setClaveDepto}
        onChangeNombre={setNombre}
        onChangeResponsable={setResponsable}
        onClose={closeCreateModal}
        onSave={insertDataDepartamentos}
      />

      <DeleteDepartmentModal
        isOpen={isDeleteModalOpen}
        keyToDelete={keyToDelete}
        departmentToDelete={departmentToDelete}
        errorMessage={deleteErrorMessage}
        isCheckingDelete={isCheckingDelete}
        isSaving={isSaving}
        onChangeKey={handleDeleteKeyChange}
        onVerify={verifyDepartmentToDelete}
        onClose={closeDeleteModal}
        onDelete={deleteDataDepartamentos}
      />
    </div>
  );
}
