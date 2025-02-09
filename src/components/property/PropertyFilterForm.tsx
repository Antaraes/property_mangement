import { JSX, useState } from "react";

interface FilterState {
  location: string;
  priceRange: { min?: number; max?: number };
  bedrooms?: number;
  bathrooms?: number;
  area: { min?: number | undefined; max?: number };
  purpose: string;
  propertyType: string;
  paidType: string;
}

const defaultFilters: FilterState = {
  location: "",
  priceRange: {},
  bedrooms: undefined,
  bathrooms: undefined,
  area: {},
  purpose: "",
  propertyType: "",
  paidType: "",
};

interface PropertyFilterFormProps {
  onFilter: (filters: FilterState) => void;
  children: (
    handleChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void,
    handleSubmit: (e: React.FormEvent) => void,
    filters: FilterState
  ) => JSX.Element;
}

export default function PropertyFilterForm({ onFilter, children }: PropertyFilterFormProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value === "" ? undefined : isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure `priceRange` and `area` remain objects
    const formattedFilters: FilterState = {
      ...filters,
      priceRange: {
        min: filters.priceRange.min ? Number(filters.priceRange.min) : undefined,
        max: filters.priceRange.max ? Number(filters.priceRange.max) : undefined,
      },
      area: {
        min: filters.area.min ? Number(filters.area.min) : undefined,
        max: filters.area.max ? Number(filters.area.max) : undefined,
      },
    };

    console.log(formattedFilters);
    onFilter(formattedFilters);
  };

  return children(handleChange, handleSubmit, filters);
}
