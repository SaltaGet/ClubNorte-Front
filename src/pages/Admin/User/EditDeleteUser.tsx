import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getApiError } from '@/utils/apiError';
import { useGetAllRoles } from '@/hooks/admin/Rol/useGetAllRoles';
import { usePointSaleGetAll } from '@/hooks/pointSale/usePointSaleGetAll';
import { useGetUserById } from '@/hooks/admin/users/useGetUserById';
import { useUserMutations } from '@/hooks/admin/users/useUserMutations';
import SuccessMessage from '@/components/generic/SuccessMessage';
import type { UserUpdateData } from '@/hooks/admin/users/userType';
import { Key, AlertCircle, Loader2, Trash2, Save } from 'lucide-react';
import Modal from '@/components/generic/Modal';
import ResetPasswordContent from './ResetPasswordContent';

interface EditDeleteUserProps {
  id: number;
  onClose?: () => void;
}

const EditDeleteUser: React.FC<EditDeleteUserProps> = ({ id, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UserUpdateData>();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { roles, isLoading: isLoadingRoles, isError: isErrorRoles, error: rolesError } = useGetAllRoles();
  const { pointSales, isLoading: isLoadingPointSales, isError: isErrorPointSales, errorMessage: pointSalesError } = usePointSaleGetAll();
  const { user, isLoading: isLoadingUser, isError: isErrorUser, error: userError } = useGetUserById(id);

  const {
    updateUser,
    deleteUser,
    isUpdating,
    isDeleting,
    isUpdated,
    isDeleted,
    updateError,
    deleteError,
    resetUpdateState,
  } = useUserMutations();

  useEffect(() => {
    if (user) {
      setValue('first_name', user.first_name);
      setValue('last_name', user.last_name);
      setValue('address', user.address);
      setValue('cellphone', user.cellphone);
      setValue('email', user.email);
      setValue('username', user.username);
      setValue('role_id', user.role.id);
      setValue('point_sales_ids', user.point_sales.map(ps => ps.id));
      setValue('is_active', user.is_active);
    }
  }, [user, setValue]);

  const watchedPointSalesIds = watch('point_sales_ids', []);

  const onSubmit = (data: UserUpdateData) => {
    updateUser({ id, data });
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este usuario?');
    if (confirmDelete) {
      deleteUser(id);
    }
  };

  const handlePointSaleToggle = (pointSaleId: number) => {
    const currentIds = watchedPointSalesIds || [];
    const newIds = currentIds.includes(pointSaleId)
      ? currentIds.filter(id => id !== pointSaleId)
      : [...currentIds, pointSaleId];
    setValue('point_sales_ids', newIds);
  };

  const inputClass = "w-full bg-slate-800/80 border border-slate-700/50 rounded-md py-1.5 px-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm transition-all";

  const mutationUpdateError = getApiError(updateError);
  const mutationDeleteError = getApiError(deleteError);

  if (isUpdated) {
    return (
      <SuccessMessage
        title="¡Usuario Actualizado!"
        description="El usuario ha sido actualizado exitosamente"
        primaryButton={{
          text: "Editar de nuevo",
          onClick: () => resetUpdateState(),
          variant: "slate"
        }}
        secondaryButton={onClose ? {
          text: "Volver",
          onClick: onClose,
          variant: "indigo"
        } : undefined}
      />
    );
  }

  if (isDeleted) {
    return (
      <SuccessMessage
        title="¡Usuario Eliminado!"
        description="El usuario ha sido eliminado exitosamente"
        primaryButton={onClose ? {
          text: "Volver",
          onClick: onClose,
          variant: "indigo"
        } : undefined}
      />
    );
  }

  if (isLoadingUser || isLoadingRoles || isLoadingPointSales) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    );
  }

  if (isErrorUser || isErrorRoles || isErrorPointSales) {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-3">
        <div className="bg-red-500/10 rounded-full p-3">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-400 text-sm text-center">
          {userError?.message || rolesError?.message || pointSalesError}
        </p>
        {onClose && (
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm">
            Volver
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Errores */}
        {(mutationUpdateError || mutationDeleteError) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-md p-2 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-xs">{mutationUpdateError?.message || mutationDeleteError?.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* Grid principal: 2 o 3 columnas según pantalla */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Nombre */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nombre</label>
              <input
                type="text"
                {...register('first_name', { required: 'Obligatorio', minLength: { value: 2, message: 'Mín 2' } })}
                className={inputClass}
                placeholder="Nombre"
                disabled={isUpdating || isDeleting}
              />
              {errors.first_name && <p className="text-red-400 text-xs mt-0.5">{errors.first_name.message}</p>}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Apellido</label>
              <input
                type="text"
                {...register('last_name', { required: 'Obligatorio', minLength: { value: 2, message: 'Mín 2' } })}
                className={inputClass}
                placeholder="Apellido"
                disabled={isUpdating || isDeleting}
              />
              {errors.last_name && <p className="text-red-400 text-xs mt-0.5">{errors.last_name.message}</p>}
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Usuario</label>
              <input
                type="text"
                {...register('username', { required: 'Obligatorio', minLength: { value: 3, message: 'Mín 3' } })}
                className={inputClass}
                placeholder="Usuario"
                disabled={isUpdating || isDeleting}
              />
              {errors.username && <p className="text-red-400 text-xs mt-0.5">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Obligatorio', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Inválido' } })}
                className={inputClass}
                placeholder="email@ejemplo.com"
                disabled={isUpdating || isDeleting}
              />
              {errors.email && <p className="text-red-400 text-xs mt-0.5">{errors.email.message}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
              <input
                type="tel"
                {...register('cellphone', { required: 'Obligatorio', minLength: { value: 8, message: 'Mín 8' } })}
                className={inputClass}
                placeholder="Teléfono"
                disabled={isUpdating || isDeleting}
              />
              {errors.cellphone && <p className="text-red-400 text-xs mt-0.5">{errors.cellphone.message}</p>}
            </div>

            {/* Rol */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Rol</label>
              <select
                {...register('role_id', { required: 'Obligatorio', valueAsNumber: true })}
                className={inputClass}
                disabled={isUpdating || isDeleting}
              >
                <option value="">Seleccionar</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              {errors.role_id && <p className="text-red-400 text-xs mt-0.5">{errors.role_id.message}</p>}
            </div>
          </div>

          {/* Dirección - Full width */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Dirección</label>
            <input
              type="text"
              {...register('address', { required: 'Obligatorio', minLength: { value: 10, message: 'Mín 10 caracteres' } })}
              className={inputClass}
              placeholder="Dirección completa"
              disabled={isUpdating || isDeleting}
            />
            {errors.address && <p className="text-red-400 text-xs mt-0.5">{errors.address.message}</p>}
          </div>

          {/* Estado activo + Puntos de venta en 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Estado activo */}
            <div className="bg-slate-800/30 rounded-md p-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="rounded border-slate-600 text-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                  disabled={isUpdating || isDeleting}
                />
                <span className="text-xs text-slate-300">Usuario activo</span>
              </label>
            </div>

            {/* Puntos de venta */}
            <div className="bg-slate-800/30 rounded-md p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Puntos de venta</span>
                <span className="text-xs text-indigo-400 font-semibold">{watchedPointSalesIds?.length || 0}</span>
              </div>
              <div className="max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                {pointSales.length === 0 ? (
                  <p className="text-slate-500 text-xs">Sin puntos</p>
                ) : (
                  <div className="space-y-1">
                    {pointSales.map((pointSale) => (
                      <label key={pointSale.id} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-700/30 px-1 py-0.5 rounded">
                        <input
                          type="checkbox"
                          checked={watchedPointSalesIds?.includes(pointSale.id) || false}
                          onChange={() => handlePointSaleToggle(pointSale.id)}
                          className="rounded border-slate-600 text-purple-500 focus:ring-1 focus:ring-purple-500/50"
                          disabled={isUpdating || isDeleting}
                        />
                        <span className="text-xs text-slate-300">{pointSale.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones en 3 columnas */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 rounded-md text-xs transition-colors flex items-center justify-center gap-1.5"
              disabled={isUpdating || isDeleting}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-md text-xs transition-colors flex items-center justify-center gap-1.5"
              disabled={isUpdating || isDeleting}
            >
              {isUpdating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Guardar</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 rounded-md text-xs transition-colors flex items-center justify-center gap-1.5"
              disabled={isUpdating || isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Eliminar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Resetear Contraseña"
        description="Se generará una nueva contraseña"
        size="md"
      >
        <ResetPasswordContent userId={id} />
      </Modal>
    </>
  );
};

export default EditDeleteUser;