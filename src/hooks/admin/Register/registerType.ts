// Para crear un registro de apertura
export interface RegisterOpenData {
  open_amount: number;
}

// Para crear un registro de cierre
export interface RegisterCloseData {
  close_amount: number;
}

// Para generar informe
export interface RegisterInformData {
  from_date: string;
  to_date: string;
}

export interface RegisterType {
  id: number;
  user_open: {
    id: number;
    first_name: string;
    last_name: string;
    address: string;
    cellphone: string;
    email: string;
    username: string;
  };
  open_amount: number;
  hour_open: string;
  user_close: {
    id: number;
    first_name: string;
    last_name: string;
    address: string;
    cellphone: string;
    email: string;
    username: string;
  } | null;
  close_amount: number | null;
  hour_close: string | null;
  total_income_cash: number;
  total_income_others: number;
  total_expense_cash: number;
  total_expense_others: number;
  is_close: boolean;
  created_at: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  cellphone: string;
  email: string;
  username: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
}

interface SportsCourt {
  id: number;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface IncomeItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Income {
  id: number;
  items: IncomeItem[];
  description: string;
  total: number;
  payment_method: string;
  created_at: string;
}

interface IncomeSportsCourt {
  id: number;
  description: string | null;
  partial_pay: number;
  partial_payment_method: string;
  date_partial_pay: string;
  partial_register_id: number | null;
  rest_pay: number | null;
  rest_payment_method: string;
  date_rest_pay: string | null;
  rest_register_id: number | null;
  sports_court: SportsCourt;
  price: number;
  created_at: string;
}


interface Expense {
  id: number;
  total: number;
  payment_method: string;
  created_at: string;
}

export interface RegisterDetails {
  id: number;
  user_open: User;
  open_amount: number;
  hour_open: string;
  user_close: User | null;
  close_amount: number | null;
  hour_close: string | null;
  total_income_cash: number;
  total_income_others: number;
  total_expense_cash: number;
  total_expense_others: number;
  is_close: boolean;
  created_at: string;
  income: Income[];
  income_sports_courts: IncomeSportsCourt[];
  expenses: Expense[];
}