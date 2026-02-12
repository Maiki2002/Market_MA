export default function DepartmentActions({
  onOpenCreate,
  onOpenDelete,
  onDownload,
  disabled,
}) {
  return (
    <aside className="products-actions">
      <button
        type="button"
        onClick={onOpenCreate}
        className="products-btn products-btn--primary"
      >
        Nuevo departamento
      </button>
      <button
        type="button"
        onClick={onOpenDelete}
        className="products-btn products-btn--danger"
        disabled={disabled}
      >
        Borrar departamento
      </button>
      <button
        type="button"
        onClick={onDownload}
        className="products-btn products-btn--secondary"
      >
        Descargar Reporte 
      </button>
    </aside>
  );
}
