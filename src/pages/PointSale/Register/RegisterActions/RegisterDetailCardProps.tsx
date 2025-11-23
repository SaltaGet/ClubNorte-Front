import React from 'react';
import { TrendingUp, TrendingDown, User, Calendar, Clock, Receipt, Trophy, DollarSign, AlertCircle } from "lucide-react";
import { useGetRegisterById } from '@/hooks/admin/Register/useGetRegisterById';
import { Badge } from "@/components/ui/badge";
import { NumericFormat } from 'react-number-format';

interface RegisterDetailCardProps {
  id: number;
}

const RegisterDetailCard: React.FC<RegisterDetailCardProps> = ({ id }) => {
  const { register, isLoading, isError, error } = useGetRegisterById(id);

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const calculateIncomeTotals = () => {
    if (!register?.income) return { cash: 0, others: 0, total: 0 };
    
    let cash = 0;
    let others = 0;
    
    register.income.forEach(income => {
      if (income.payment_method === 'efectivo') {
        cash += income.total;
      } else {
        others += income.total;
      }
    });
    
    return { cash, others, total: cash + others };
  };

  const calculateSportsCourtTotals = () => {
    if (!register?.income_sports_courts) return { cash: 0, others: 0, total: 0 };
    
    let cash = 0;
    let others = 0;
    
    register.income_sports_courts.forEach(income => {
      if (income.partial_register_id === id) {
        if (income.partial_payment_method === 'efectivo') {
          cash += income.partial_pay;
        } else {
          others += income.partial_pay;
        }
      }
      
      if (income.rest_pay && income.rest_register_id === id) {
        if (income.rest_payment_method === 'efectivo') {
          cash += income.rest_pay;
        } else {
          others += income.rest_pay;
        }
      }
    });
    
    return { cash, others, total: cash + others };
  };

  const calculateExpenseTotals = () => {
    if (!register?.expenses) return { cash: 0, others: 0, total: 0 };
    
    let cash = 0;
    let others = 0;
    
    register.expenses.forEach(expense => {
      if (expense.payment_method === 'efectivo') {
        cash += expense.total;
      } else {
        others += expense.total;
      }
    });
    
    return { cash, others, total: cash + others };
  };

  const CurrencyDisplay = ({ value }: { value: number }) => (
    <NumericFormat
      value={value}
      displayType="text"
      thousandSeparator="."
      decimalSeparator=","
      prefix="$"
      decimalScale={0}
      fixedDecimalScale
    />
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Cargando registro...</p>
      </div>
    );
  }

  if (isError || !register) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <div className="bg-red-500/10 rounded-full p-3">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-400 text-sm text-center">
          {error?.message || "Error al cargar el registro"}
        </p>
      </div>
    );
  }

  const incomeTotals = calculateIncomeTotals();
  const sportsCourtTotals = calculateSportsCourtTotals();
  const expenseTotals = calculateExpenseTotals();

  const totalIncome = incomeTotals.total + sportsCourtTotals.total;
  const totalExpense = expenseTotals.total;
  const netBalance = totalIncome - totalExpense;
  const expectedClose = register.open_amount + netBalance;
  
  const cashBalance = incomeTotals.cash + sportsCourtTotals.cash - expenseTotals.cash;
  const expectedCashClose = register.open_amount + cashBalance;

  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
      {/* Header compacto con ID y estado */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Registro #{register.id}</h2>
          </div>
          <Badge className={register.is_close ? "bg-emerald-500 text-white border-0" : "bg-amber-500 text-white border-0"}>
            {register.is_close ? "Cerrado" : "Abierto"}
          </Badge>
        </div>
        
        {/* Montos apertura/cierre en el header */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 rounded-md p-2">
            <p className="text-xs text-indigo-200 mb-0.5">Apertura</p>
            <p className="text-base font-bold text-white"><CurrencyDisplay value={register.open_amount} /></p>
          </div>
          {register.is_close && register.close_amount !== null && (
            <div className="bg-white/10 rounded-md p-2">
              <p className="text-xs text-indigo-200 mb-0.5">Cierre</p>
              <p className="text-base font-bold text-white"><CurrencyDisplay value={register.close_amount} /></p>
            </div>
          )}
        </div>
      </div>

      {/* Usuario que abrió - Compacto */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-blue-400" />
          <p className="text-xs text-slate-400 font-medium">Abierto por</p>
        </div>
        <p className="text-sm text-white font-semibold">{register.user_open.first_name} {register.user_open.last_name}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3" />
          {formatDateTime(register.hour_open)}
        </p>
      </div>

      {/* Ingresos (Productos) - Compacto */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-emerald-400">Ingresos Productos</h4>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-slate-800/50 rounded px-2 py-1.5">
            <p className="text-xs text-slate-400">Efectivo</p>
            <p className="text-sm font-semibold text-emerald-400"><CurrencyDisplay value={incomeTotals.cash} /></p>
          </div>
          <div className="bg-slate-800/50 rounded px-2 py-1.5">
            <p className="text-xs text-slate-400">Otros</p>
            <p className="text-sm font-semibold text-emerald-400"><CurrencyDisplay value={incomeTotals.others} /></p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
          <span className="text-xs text-emerald-300 font-medium">Total</span>
          <span className="text-base font-bold text-emerald-400"><CurrencyDisplay value={incomeTotals.total} /></span>
        </div>
      </div>

      {/* Canchas Deportivas - Solo si existen */}
      {register.income_sports_courts && register.income_sports_courts.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-bold text-blue-400">Canchas Deportivas</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-slate-800/50 rounded px-2 py-1.5">
              <p className="text-xs text-slate-400">Efectivo</p>
              <p className="text-sm font-semibold text-blue-400"><CurrencyDisplay value={sportsCourtTotals.cash} /></p>
            </div>
            <div className="bg-slate-800/50 rounded px-2 py-1.5">
              <p className="text-xs text-slate-400">Otros</p>
              <p className="text-sm font-semibold text-blue-400"><CurrencyDisplay value={sportsCourtTotals.others} /></p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-blue-500/20">
            <span className="text-xs text-blue-300 font-medium">Total</span>
            <span className="text-base font-bold text-blue-400"><CurrencyDisplay value={sportsCourtTotals.total} /></span>
          </div>
        </div>
      )}

      {/* Egresos - Compacto */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <h4 className="text-sm font-bold text-red-400">Egresos</h4>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-slate-800/50 rounded px-2 py-1.5">
            <p className="text-xs text-slate-400">Efectivo</p>
            <p className="text-sm font-semibold text-red-400"><CurrencyDisplay value={expenseTotals.cash} /></p>
          </div>
          <div className="bg-slate-800/50 rounded px-2 py-1.5">
            <p className="text-xs text-slate-400">Otros</p>
            <p className="text-sm font-semibold text-red-400"><CurrencyDisplay value={expenseTotals.others} /></p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-red-500/20">
          <span className="text-xs text-red-300 font-medium">Total</span>
          <span className="text-base font-bold text-red-400"><CurrencyDisplay value={expenseTotals.total} /></span>
        </div>
      </div>

      {/* Balance Final - Destacado */}
      <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border-2 border-purple-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-purple-400" />
          <h4 className="text-sm font-bold text-purple-300">Balance Final</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Balance Neto</span>
            <span className={`text-lg font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <CurrencyDisplay value={netBalance} />
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
            <span className="text-sm text-white font-semibold">Cierre Esperado</span>
            <span className="text-xl font-bold text-white">
              <CurrencyDisplay value={expectedClose} />
            </span>
          </div>
        </div>
      </div>

      {/* Usuario que cerró - Solo si está cerrado */}
      {register.is_close && register.user_close && (
        <>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-400 font-medium">Cerrado por</p>
            </div>
            <p className="text-sm text-white font-semibold">{register.user_close.first_name} {register.user_close.last_name}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {formatDateTime(register.hour_close!)}
            </p>
          </div>
          
          {register.close_amount !== null && (
            <div className={`rounded-lg p-3 border ${
              register.close_amount === expectedCashClose 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Diferencia en Caja</span>
                <span className={`text-lg font-bold ${
                  register.close_amount === expectedCashClose 
                    ? 'text-emerald-400' 
                    : 'text-amber-400'
                }`}>
                  <CurrencyDisplay value={register.close_amount - expectedCashClose} />
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Contador de transacciones - Grid compacto */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/50">
          <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-xs text-slate-400">Ingresos</p>
          <p className="text-lg font-bold text-white">{register.income.length}</p>
        </div>
        
        {register.income_sports_courts && register.income_sports_courts.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/50">
            <Trophy className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">Canchas</p>
            <p className="text-lg font-bold text-white">{register.income_sports_courts.length}</p>
          </div>
        )}
        
        <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/50">
          <TrendingDown className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <p className="text-xs text-slate-400">Egresos</p>
          <p className="text-lg font-bold text-white">{register.expenses.length}</p>
        </div>
      </div>

      {/* Fecha de creación - Footer */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-700/50">
        <Calendar className="w-3 h-3" />
        <span>Creado: {new Date(register.created_at).toLocaleDateString('es-AR')}</span>
      </div>
    </div>
  );
};

export default RegisterDetailCard;