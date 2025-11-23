import {
  DollarSign,
  ListOrdered,
  Package,
  Boxes,
  Wallet,
  DoorOpen,
  Grid,
  PlusSquare,
  PlusCircle,
  Volleyball,
  type LucideIcon,
  BarChart3,
} from "lucide-react";
import type { JSX } from "react";
import IncomeCreate from "../Income/IncomeCreate";
import TableIncomes from "../Income/TableIncomes";
import IncomeSportCourtCreate from "../IncomeSportCourt/IncomeSportCourtCreate";
import TableIncomesSportCourt from "../IncomeSportCourt/TableIncomesSportCourt";
import RegisterPointSale from "../Register/RegisterPointSale";
import FormCreateSportCourt from "../SportCourt/FromCreateSportCourt";
import TableSportCourt from "../SportCourt/TableSportCourt";
import TableRegisters from "../Register/TableRegisters";
import ExpenseCreate from "../Expense/ExpenseCreate";
import TableExpenses from "../Expense/TableExpense";
import ViewProductPointSale from "../ProductPoinSale/ViewProductPointSale";

// ==================== DEFINICIÓN DE ROLES ====================
export const UserRole = {
  ADMIN: "admin",
  VENDEDOR: "vendedor",
  REPONEDOR: "repositor",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// ==================== TIPOS DE CONFIGURACIÓN ====================
export interface Action {
  id: string;
  name: string;
  icon: LucideIcon;
  component: () => JSX.Element;
  allowedRoles?: UserRole[]; // Si está vacío o no existe, todos pueden ver
}

export interface Model {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  allowedRoles?: UserRole[]; // Si está vacío o no existe, todos pueden ver
  actions: Action[];
}

export interface Section {
  id: string;
  name: string;
  allowedRoles?: UserRole[]; // Si está vacío o no existe, todos pueden ver
  models: Model[];
}

export interface PointSaleConfig {
  sections: Section[];
}

// ==================== CONFIGURACIÓN PRINCIPAL ====================
export const pointSaleConfig: PointSaleConfig = {
  sections: [
    {
      id: "Ingreso",
      name: "Ingreso",
      // allowedRoles vacío = todos pueden ver
      models: [
        {
          id: "income",
          name: "Ingreso",
          icon: DollarSign,
          color: "text-green-500",
          // Todos pueden ver el modelo
          actions: [
            {
              id: "crear-ingreso",
              name: "Crear Ingreso",
              icon: PlusCircle,
              component: IncomeCreate,
              allowedRoles: [UserRole.ADMIN, UserRole.VENDEDOR, UserRole.REPONEDOR],
            },
            {
              id: "list-ingreso",
              name: "Lista de Ingresos",
              icon: ListOrdered,
              component: TableIncomes,
              // Todos pueden ver
            },
            {
              id: "crear-ingreso-cancha",
              name: "Crear Ingreso Cancha",
              icon: PlusCircle,
              component: IncomeSportCourtCreate,
              allowedRoles: [UserRole.ADMIN, UserRole.VENDEDOR, UserRole.REPONEDOR],
            },
            {
              id: "list-ingreso-cancha",
              name: "Lista de Ingresos Cancha",
              icon: ListOrdered,
              component: TableIncomesSportCourt,
              // Todos pueden ver
            },
          ],
        },
      ],
    },
    {
      id: "Gastos",
      name: "Gastos",
      // Removido allowedRoles para que todos vean la sección
      models: [
        {
          id: "expense",
          name: "Gastos",
          icon: DollarSign,
          color: "text-red-400",
          actions: [
            {
              id: "crear-gasto",
              name: "Crear Gasto",
              icon: PlusCircle,
              component: ExpenseCreate,
              allowedRoles: [UserRole.ADMIN, UserRole.VENDEDOR, UserRole.REPONEDOR],
            },
            {
              id: "list-gastos",
              name: "Lista de Gastos",
              icon: ListOrdered,
              component: TableExpenses,
              allowedRoles: [UserRole.ADMIN, UserRole.VENDEDOR, UserRole.REPONEDOR],
            },
          ],
        },
      ],
    },
    {
      id: "Productos",
      name: "Gestión de Productos",
      models: [
        {
          id: "productos",
          name: "Productos",
          icon: Package,
          color: "text-blue-500",
          // Todos pueden ver productos
          actions: [
            {
              id: "listar",
              name: "Listar Productos",
              icon: Boxes,
              component: ViewProductPointSale,
              // Todos pueden listar
            },
          ],
        },
      ],
    },
    {
      id: "Caja",
      name: "Caja e Informes",
      allowedRoles: [UserRole.ADMIN, UserRole.VENDEDOR, UserRole.REPONEDOR],
      models: [
        {
          id: "caja",
          name: "Caja",
          icon: Wallet,
          color: "text-purple-500",
          actions: [
            {
              id: "abrir-cerrar",
              name: "Abrir / Cerrar Caja",
              icon: DoorOpen,
              component: RegisterPointSale,
              allowedRoles: [UserRole.ADMIN, UserRole.VENDEDOR, UserRole.REPONEDOR],
            },
            {
              id: "registro-caja",
              name: "Registro de Caja",
              icon: BarChart3,
              component: TableRegisters,
              // Todos los que acceden a Caja pueden ver registros
            },
          ],
        },
      ],
    },
    {
      id: "canchas",
      name: "Canchas",
      models: [
        {
          id: "canchas",
          name: "Canchas",
          icon: Volleyball,
          color: "text-orange-500",
          // Todos pueden ver canchas
          actions: [
            {
              id: "crear-cancha",
              name: "Crear Cancha",
              icon: PlusSquare,
              component: FormCreateSportCourt,
              allowedRoles: [UserRole.ADMIN],
            },
            {
              id: "listar-cancha",
              name: "Lista de Canchas",
              icon: Grid,
              component: TableSportCourt,
              // Todos pueden listar
            },
          ],
        },
      ],
    },
  ],
};

// ==================== FUNCIONES UTILITARIAS ====================

/**
 * Verifica si un usuario tiene permiso para acceder a un recurso
 * Si allowedRoles está vacío o no existe = todos pueden acceder
 */
export const hasPermission = (
  userRole: UserRole | string | undefined,
  allowedRoles?: UserRole[]
): boolean => {
  // Si no hay roles definidos o está vacío, todos tienen acceso
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Si el usuario no tiene rol, no tiene acceso a recursos restringidos
  if (!userRole) {
    return false;
  }

  // Verificar si el rol del usuario está en la lista de permitidos
  return allowedRoles.includes(userRole as UserRole);
};

/**
 * Filtra la configuración según el rol del usuario
 */
export const filterConfigByRole = (
  config: PointSaleConfig,
  userRole: UserRole | string | undefined
): PointSaleConfig => {
  return {
    sections: config.sections
      .filter((section) => hasPermission(userRole, section.allowedRoles))
      .map((section) => ({
        ...section,
        models: section.models
          .filter((model) => hasPermission(userRole, model.allowedRoles))
          .map((model) => ({
            ...model,
            actions: model.actions.filter((action) =>
              hasPermission(userRole, action.allowedRoles)
            ),
          }))
          .filter((model) => model.actions.length > 0), // Eliminar modelos sin acciones
      }))
      .filter((section) => section.models.length > 0), // Eliminar secciones sin modelos
  };
};

/**
 * Función utilitaria para obtener todas las acciones aplanadas
 */
export const getAllActions = (config: PointSaleConfig) => {
  return config.sections.flatMap((s) =>
    s.models.flatMap((m) =>
      m.actions.map((a) => ({ ...a, modelName: m.name, sectionName: s.name }))
    )
  );
};