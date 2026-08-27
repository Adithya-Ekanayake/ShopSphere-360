export interface FilterOption {
  value: string | number;
  label: string;
}

export interface FilterOptions {
  segments: FilterOption[];
  channels: FilterOption[];
  locations: FilterOption[];
  categories: FilterOption[];
  brands: FilterOption[];
  subcategories: FilterOption[];
  statuses: FilterOption[];
  countries: FilterOption[];
  products: FilterOption[];
}

export interface DashboardFilters {
  startDate: string;
  endDate: string;
  productKey: string;
  segment: string;
  channelKey: string;
  locationKey: string;
  status: string;
}

export type FilterKey = keyof DashboardFilters;

export interface FilterContextValue {
  filters: DashboardFilters;
  filterOptions: FilterOptions | null;
  isLoadingOptions: boolean;
  updateFilter: (key: FilterKey, value: string) => void;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  clearFilter: (key: FilterKey) => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  loadFilterOptions: () => Promise<void>;
}