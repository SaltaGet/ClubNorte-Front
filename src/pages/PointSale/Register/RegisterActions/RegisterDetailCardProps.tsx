import React from 'react';
import {  TrendingUp, TrendingDown, User, Calendar, Clock, Receipt, Trophy} from "lucide-react";
import { useGetRegisterById } from '@/hooks/admin/Register/useGetRegisterById';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

  // Calcular totales de ingresos (productos)
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

  // Calcular totales de canchas deportivas (solo pagos que pertenecen a este registro)
  const calculateSportsCourtTotals = () => {
    if (!register?.income_sports_courts) return { cash: 0, others: 0, total: 0 };
    
    let cash = 0;
    let others = 0;
    
    register.income_sports_courts.forEach(income => {
      // Verificar si el pago parcial pertenece a ESTE registro
      if (income.partial_register_id === id) {
        if (income.partial_payment_method === 'efectivo') {
          cash += income.partial_pay;
        } else {
          others += income.partial_pay;
        }
      }
      
      // Verificar si el pago restante pertenece a ESTE registro
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

  // Calcular totales de egresos
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
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            <div className="h-4 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !register) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6">
        <div className="text-center">
          <p className="text-red-400 text-sm">
            {error?.message || "Error al cargar el registro"}
          </p>
        </div>
      </div>
    );
  }

  // Calcular todos los totales
  const incomeTotals = calculateIncomeTotals();
  const sportsCourtTotals = calculateSportsCourtTotals();
  const expenseTotals = calculateExpenseTotals();

  // Balance total (ingresos + canchas - egresos)
  const totalIncome = incomeTotals.total + sportsCourtTotals.total;
  const totalExpense = expenseTotals.total;
  const netBalance = totalIncome - totalExpense;
  const expectedClose = register.open_amount + netBalance;
  
  // Balance en efectivo (solo caja física)
  const cashBalance = incomeTotals.cash + sportsCourtTotals.cash - expenseTotals.cash;
  const expectedCashClose = register.open_amount + cashBalance;

  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50 hover:scrollbar-thumb-slate-500">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            Registro #{register.id}
          </h2>
          <Badge className={register.is_close ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"}>
            {register.is_close ? "Cerrado" : "Abierto"}
          </Badge>
        </div>

        {/* Usuario que abrió */}
        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
          <User className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Abierto por</p>
            <p className="text-white font-medium">{register.user_open.first_name} {register.user_open.last_name}</p>
            <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {formatDateTime(register.hour_open)}
            </p>
          </div>
        </div>

        {/* Montos de Apertura/Cierre */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Monto Apertura</p>
            <p className="text-lg font-semibold text-white"><CurrencyDisplay value={register.open_amount} /></p>
          </div>
          {register.is_close && register.close_amount !== null && (
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Monto Cierre</p>
              <p className="text-lg font-semibold text-white"><CurrencyDisplay value={register.close_amount} /></p>
            </div>
          )}
        </div>

        <Separator className="bg-white/10" />

        {/* Ingresos (Productos) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <h4 className="font-medium text-sm uppercase tracking-wide">Ingresos (Productos)</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between bg-slate-800/30 rounded px-3 py-2">
              <span className="text-slate-300">Efectivo:</span>
              <span className="text-emerald-400 font-medium"><CurrencyDisplay value={incomeTotals.cash} /></span>
            </div>
            <div className="flex justify-between bg-slate-800/30 rounded px-3 py-2">
              <span className="text-slate-300">Otros:</span>
              <span className="text-emerald-400 font-medium"><CurrencyDisplay value={incomeTotals.others} /></span>
            </div>
          </div>
          <div className="flex justify-between px-3 py-2 bg-emerald-500/10 rounded border border-emerald-500/20">
            <span className="text-slate-200 font-medium">Total:</span>
            <span className="text-emerald-400 font-semibold"><CurrencyDisplay value={incomeTotals.total} /></span>
          </div>
        </div>

        {/* Canchas Deportivas */}
        {register.income_sports_courts && register.income_sports_courts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <Trophy className="w-4 h-4" />
              <h4 className="font-medium text-sm uppercase tracking-wide">Canchas Deportivas</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between bg-slate-800/30 rounded px-3 py-2">
                <span className="text-slate-300">Efectivo:</span>
                <span className="text-blue-400 font-medium"><CurrencyDisplay value={sportsCourtTotals.cash} /></span>
              </div>
              <div className="flex justify-between bg-slate-800/30 rounded px-3 py-2">
                <span className="text-slate-300">Otros:</span>
                <span className="text-blue-400 font-medium"><CurrencyDisplay value={sportsCourtTotals.others} /></span>
              </div>
            </div>
            <div className="flex justify-between px-3 py-2 bg-blue-500/10 rounded border border-blue-500/20">
              <span className="text-slate-200 font-medium">Total:</span>
              <span className="text-blue-400 font-semibold"><CurrencyDisplay value={sportsCourtTotals.total} /></span>
            </div>
          </div>
        )}

        {/* Egresos */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-400">
            <TrendingDown className="w-4 h-4" />
            <h4 className="font-medium text-sm uppercase tracking-wide">Egresos</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between bg-slate-800/30 rounded px-3 py-2">
              <span className="text-slate-300">Efectivo:</span>
              <span className="text-red-400 font-medium"><CurrencyDisplay value={expenseTotals.cash} /></span>
            </div>
            <div className="flex justify-between bg-slate-800/30 rounded px-3 py-2">
              <span className="text-slate-300">Otros:</span>
              <span className="text-red-400 font-medium"><CurrencyDisplay value={expenseTotals.others} /></span>
            </div>
          </div>
          <div className="flex justify-between px-3 py-2 bg-red-500/10 rounded border border-red-500/20">
            <span className="text-slate-200 font-medium">Total:</span>
            <span className="text-red-400 font-semibold"><CurrencyDisplay value={expenseTotals.total} /></span>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Balance Total */}
        <div className="space-y-2">
          <div className="flex justify-between px-3 py-2 bg-indigo-500/10 rounded border border-indigo-500/20">
            <span className="text-slate-200 font-medium">Balance Neto Total:</span>
            <span className={`font-semibold ${netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <CurrencyDisplay value={netBalance} />
            </span>
          </div>
          <div className="flex justify-between px-3 py-2 bg-indigo-600/20 rounded border border-indigo-500/30">
            <span className="text-white font-medium">Cierre Esperado Total:</span>
            <span className="text-white font-bold"><CurrencyDisplay value={expectedClose} /></span>
          </div>
        </div>


        {/* Usuario que cerró */}
        {register.is_close && register.user_close && (
          <>
            <Separator className="bg-white/10" />
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <User className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Cerrado por</p>
                <p className="text-white font-medium">{register.user_close.first_name} {register.user_close.last_name}</p>
                <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(register.hour_close!)}
                </p>
              </div>
            </div>
            
            {register.close_amount !== null && (
              <div className={`flex justify-between px-3 py-2 rounded ${
                register.close_amount === expectedCashClose 
                  ? 'bg-emerald-500/10 border border-emerald-500/20' 
                  : 'bg-amber-500/10 border border-amber-500/20'
              }`}>
                <span className="text-slate-200 font-medium">Diferencia en Caja:</span>
                <span className={`font-semibold ${
                  register.close_amount === expectedCashClose 
                    ? 'text-emerald-400' 
                    : 'text-amber-400'
                }`}>
                  <CurrencyDisplay value={register.close_amount - expectedCashClose} />
                </span>
              </div>
            )}
          </>
        )}

        {/* Contador de transacciones */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-400">Ingresos</p>
              <p className="text-white font-semibold text-lg">{register.income.length}</p>
            </div>
          </div>
          {register.income_sports_courts && register.income_sports_courts.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-3">
              <Trophy className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Canchas</p>
                <p className="text-white font-semibold text-lg">{register.income_sports_courts.length}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg p-3">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <div>
              <p className="text-xs text-slate-400">Egresos</p>
              <p className="text-white font-semibold text-lg">{register.expenses.length}</p>
            </div>
          </div>
        </div>

        {/* Fecha de creación */}
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-white/10">
          <Calendar className="w-3 h-3" />
          <span>Creado: {new Date(register.created_at).toLocaleDateString('es-AR')}</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterDetailCard;