export default function CreateProductModal({
  isOpen,
  nombre,
  proveedor,
  errorMessage,
  isSaving,
  onChangeNombre,
  onChangeProveedor,
  onClose,
  onSave,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Agregar producto
        </h3>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm text-slate-700">Nombre</span>
          <input
            type="text"
            value={nombre}
            onChange={(event) => onChangeNombre(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Nombre del producto"
          />
        </label>

        <label className="mb-2 block">
          <span className="mb-1 block text-sm text-slate-700">Proveedor</span>
          <input
            type="text"
            value={proveedor}
            onChange={(event) => onChangeProveedor(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Nombre del proveedor"
          />
        </label>

        {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
