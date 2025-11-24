import { Search } from "lucide-react";

interface BulkMovementFiltersProps {
  searchName: string;
  setSearchName: (value: string) => void;
  selectedCategoryId: number | null;
  setSelectedCategoryId: (value: number | null) => void;
  categories: Array<{ id: number; name: string }>;
  isLoadingCategories: boolean;
  isFilteringByCategory: boolean;
}

const BulkMovementFilters = ({
  searchName,
  setSearchName,
  selectedCategoryId,
  setSelectedCategoryId,
  categories,
  isLoadingCategories,
  isFilteringByCategory,
}: BulkMovementFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Buscar por nombre */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            if (e.target.value.trim()) {
              setSelectedCategoryId(null);
            }
          }}
          disabled={isFilteringByCategory}
          className={`w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
            isFilteringByCategory ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </div>

      {/* Filtro por categoría */}
      <div>
        <select
          value={selectedCategoryId ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedCategoryId(value ? Number(value) : null);
            setSearchName("");
          }}
          disabled={searchName.trim().length > 0}
          className={`w-full bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
            searchName.trim().length > 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <option value="">Todas las categorías</option>
          {isLoadingCategories ? (
            <option disabled>Cargando categorías...</option>
          ) : (
            categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};

export default BulkMovementFilters;