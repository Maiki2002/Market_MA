export default function DeleteDepartmentModal({
  isOpen,
  keyToDelete,
  departmentToDelete,
  errorMessage,
  isCheckingDelete,
  isSaving,
  onChangeKey,
  onVerify,
  onClose,
  onDelete,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Borrar departamento
        </h3>

        <label className="mb-2 block">
          <span className="mb-1 block text-sm text-slate-700">Clave del departamento</span>
          <input
            type="text"
            value={keyToDelete}
            onChange={(event) => onChangeKey(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
            placeholder="Ejemplo: depto_ventas"
          />
        </label>

        <button
          type="button"
          onClick={onVerify}
          className="mb-3 rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isCheckingDelete || isSaving}
        >
          {isCheckingDelete ? "Verificando..." : "Verificar departamento"}
        </button>

        {departmentToDelete && (
          <div className="mb-2 rounded border border-red-200 bg-red-50 p-3">
            <p className="mb-2 text-sm font-semibold text-red-900">
              Confirma el borrado. Estos son todos los datos:
            </p>
            <ul className="space-y-1 text-sm text-red-900">
              {Object.entries(departmentToDelete).map(([key, value]) => (
                <li key={key}>
                  <span className="font-semibold">{key}:</span>{" "}
                  {value === null || value === undefined ? "-" : String(value)}
                </li>
              ))}
            </ul>
          </div>
        )}

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
            onClick={onDelete}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving || !departmentToDelete}
          >
            {isSaving ? "Borrando..." : "Borrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
