import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import analyticsService from "../services/analyticsService";
import type {
  DashboardFilters,
  FilterOptions,
  FilterContextValue,
  FilterKey,
} from "../types/filters";

/* ── Initial State ────────────────────────────────────────────── */
const DEFAULT_FILTERS: DashboardFilters = {
  startDate: "",
  endDate: "",
  productKey: "",
  segment: "",
  channelKey: "",
  locationKey: "",
  status: "",
};

/* ── Context ──────────────────────────────────────────────────── */
const FilterContext = createContext<FilterContextValue | null>(null);

/* ── Provider ─────────────────────────────────────────────────── */
export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  /* ── Load Filter Options ─────────────────────────────────────── */
  const loadFilterOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    try {
      const options = await analyticsService.getFilterOptions();
      setFilterOptions(options);
    } catch (err) {
      console.error("Failed to load filter options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  /* ── Filter Actions ─────────────────────────────────────────── */
  const updateFilter = useCallback((key: FilterKey, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const clearFilter = useCallback((key: FilterKey) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  }, []);

  /* ── Computed ───────────────────────────────────────────────── */
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");
  const activeFilterCount = Object.values(filters).filter((v) => v !== "").length;

  return (
    <FilterContext.Provider
      value={{
        filters,
        filterOptions,
        isLoadingOptions,
        updateFilter,
        updateFilters,
        resetFilters,
        clearFilter,
        hasActiveFilters,
        activeFilterCount,
        loadFilterOptions,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

/* ── Hook ─────────────────────────────────────────────────────── */
export const useFilters = (): FilterContextValue => {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return ctx;
};

export default FilterContext;