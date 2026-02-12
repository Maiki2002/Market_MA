export default function DepartmentList({ departments }) {
  return (
    <section className="page-card products-card">
      <h2 className="page-title">Departamentos</h2>
      <p className="page-text products-summary">
        {departments.length} departamento{departments.length === 1 ? "" : "s"} registrados
      </p>

      <div className="products-scroll">
        {departments.length === 0 ? (
          <div className="products-empty">No hay departamentos registrados.</div>
        ) : (
          <div className="products-table-wrap">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Clave</th>
                  <th>Nombre</th>
                  <th>Responsable</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.claveDepto}>
                    <td>
                      <span className="products-id-badge">#{department.claveDepto}</span>
                    </td>
                    <td>
                      <span className="products-table-name">
                        {department.nombre || "Sin nombre"}
                      </span>
                    </td>
                    <td>
                      <span className="products-provider-chip">
                        {department.responsable || "Sin responsable"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
