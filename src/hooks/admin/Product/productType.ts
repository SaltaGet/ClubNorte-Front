import type { Category } from "../Category/categoryType";

interface StockPoint {
  id: number;
  name: string;
  stock: number;
}

interface StockDeposit {
  id: number;
  stock: number;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  min_amount: number;
  notifier: boolean;
  stock_point_sales: StockPoint[] | null;
  stock_deposit: StockDeposit;
}

// para crear un producto
export interface ProductCreateData {
  category_id: number;
  code: string;
  description?: string ;
  name: string;
  price: number;
  min_amount: number;
  notifier: boolean;
}

// para actualizar un producto
export interface ProductUpdateData {
  category_id: number;
  code: string;
  description?: string;
  name: string;
  price: number;
  min_amount: number;
  notifier: boolean;
}

// para edición masiva de precios
export interface BulkPriceUpdate {
  list: {
    id: number;
    price: number;
  }[];
}