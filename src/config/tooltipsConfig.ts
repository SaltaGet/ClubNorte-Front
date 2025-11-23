// src/config/tooltipConfig.ts

export type TooltipItem = {
  title: string;
  description: string;
};

export const tooltipConfig: Record<string, TooltipItem> = {
  appGeneral: {
    title: "Bienvenido al Sistema de Gestión Club Norte",
    description: `Sistema integral de administración para puntos de venta, inventario y reportes.

═══════════════════════════════════════

🔐 INICIO DE SESIÓN Y SEGURIDAD

El sistema cuenta con autenticación segura mediante email y contraseña. Cada usuario tiene asignado un rol específico (Administrador, Repositor o Vendedor) que determina sus permisos y accesos dentro de la plataforma.

═══════════════════════════════════════

👥 MÓDULO DE ADMINISTRACIÓN

DASHBOARD PRINCIPAL
Panel central donde visualizás toda la información de tus puntos de venta asignados. Accedés rápidamente a cada ubicación y ves el estado general del negocio.

GESTIÓN DE PRODUCTOS
Administrá el catálogo completo de productos:
• Crear nuevos productos con código, nombre, precio y categoría
• Editar información de productos existentes
• Eliminar productos del sistema
• Edición masiva para actualizar múltiples productos
• Asignar productos a categorías específicas

GESTIÓN DE CATEGORÍAS
Organizá tus productos en categorías personalizadas para facilitar la búsqueda y clasificación. Creá, editá y visualizá todas las categorías disponibles.

GESTIÓN DE USUARIOS
Control total del personal:
• Crear nuevos usuarios del sistema
• Asignar roles y permisos específicos
• Activar o desactivar cuentas de usuario
• Resetear contraseñas cuando sea necesario
• Asociar usuarios a puntos de venta específicos
• Visualizar historial de actividad

CONTROL DE STOCK GENERAL
Administrá el inventario del depósito central:
• Ver stock disponible de todos los productos
• Realizar ajustes de inventario
• Transferir productos a puntos de venta
• Historial completo de movimientos
• Alertas de stock bajo o crítico

═══════════════════════════════════════

🏪 PUNTOS DE VENTA

Cada punto de venta es un módulo completo con:

REGISTRO DE INGRESOS
• Ventas de productos del inventario local
• Ingresos por canchas deportivas
• Otros ingresos personalizados
• Historial detallado con fecha, monto y descripción

GESTIÓN DE GASTOS
• Registro de egresos y gastos operativos
• Categorización de gastos
• Control de flujo de caja
• Reportes de gastos por período

CANCHAS DEPORTIVAS
• Gestión de reservas de canchas
• Control de disponibilidad horaria
• Registro de pagos y cobros
• Historial de uso

INVENTARIO LOCAL
• Stock disponible en el punto de venta
• Solicitar productos del depósito central
• Transferir productos entre puntos de venta
• Ajustes de inventario local
• Trazabilidad de movimientos

CAJA Y REGISTRO
• Control de caja diaria
• Apertura y cierre de caja
• Conciliación de efectivo
• Historial de transacciones

═══════════════════════════════════════

📊 REPORTES Y ANÁLISIS

PRODUCTOS MÁS RENTABLES
Identificá qué productos generan mayor ganancia, con análisis de ventas, costos y márgenes de utilidad.

CONTROL DE STOCK POR UBICACIÓN
Visualizá el inventario disponible en cada punto de venta y en el depósito central. Detectá productos con bajo stock.

MOVIMIENTOS DE INVENTARIO
Seguimiento completo de todas las transferencias, ajustes y movimientos de productos entre ubicaciones.

RENTABILIDAD POR PUNTO DE VENTA
Analizá el desempeño financiero de cada ubicación: ingresos, gastos y rentabilidad neta.

EXPORTACIÓN DE INFORMES
Descargá reportes en formato Excel o PDF para análisis externos o presentaciones.

═══════════════════════════════════════

📦 GESTIÓN AVANZADA DE STOCK

TRANSFERENCIAS ENTRE DEPÓSITOS
Mové productos del depósito central a puntos de venta de forma controlada y trazable.

TRANSFERENCIAS ENTRE PUNTOS DE VENTA
Redistribuí inventario entre diferentes ubicaciones según la demanda.

AJUSTES DE INVENTARIO
Corregí discrepancias entre el stock físico y el sistema, con registro de motivos.

TRAZABILIDAD COMPLETA
Cada movimiento queda registrado con fecha, usuario responsable, origen, destino y cantidad.

ALERTAS AUTOMÁTICAS
Recibí notificaciones cuando productos alcancen niveles críticos de stock.

═══════════════════════════════════════

💡 CARACTERÍSTICAS DESTACADAS

✓ Interfaz intuitiva y moderna
✓ Diseño responsive (funciona en móviles y tablets)
✓ Sistema de permisos granular
✓ Historial completo de operaciones
✓ Búsqueda y filtros avanzados
✓ Exportación de datos
✓ Modo oscuro optimizado`,
  },

  pointSalesAdmin: {
    title: "Tus Puntos de Venta",
    description: "Visualizá y administrá los puntos de venta a los que estás asignado.",
  },

  productAdmin: {
    title: "Administrador de Productos",
    description:
      "Gestioná tus productos: crear, listar, editar y eliminar productos del depósito. Incluye edición masiva.",
  },

  categoryAdmin: {
    title: "Administrador de Categorías",
    description:
      "Gestioná las categorías de tus productos. Podés listar y crear categorías fácilmente.",
  },

  userAdmin: {
    title: "Administrador de Usuarios",
    description:
      "Gestioná los usuarios del negocio: crear, listar, editar, activar o desactivar usuarios, resetear contraseñas, asignar roles y asociar puntos de venta.",
  },

  stockAdmin: {
    title: "Administrador de Stock",
    description:
      "Gestioná el stock del depósito general y de cada punto de venta. Mové productos entre depósitos y puntos de venta, realizá transferencias entre sucursales y editá el stock del depósito general.",
  },
};

export type TooltipKey = keyof typeof tooltipConfig;
