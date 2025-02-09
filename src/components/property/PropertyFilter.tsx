import { useState } from "react";
import { Search, Filter as FilterIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import PropertyFilterForm from "./PropertyFilterForm";

interface InputFieldProps {
  label: string;
  name: string;
  type?: "text" | "number";
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  onChange,
}) => (
  <div>
    <Label className="block text-sm font-medium text-gray-700 mb-2">{label}</Label>
    <Input
      type={type}
      name={name}
      placeholder={placeholder}
      className="w-full p-3 border rounded-lg"
      onChange={onChange}
    />
  </div>
);

interface SelectFieldProps {
  label: string;
  name: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, name, options, onChange }) => (
  <div>
    <Label className="block text-sm font-medium text-gray-700 mb-2">{label}</Label>
    <select name={name} className="w-full p-3 border rounded-lg" onChange={onChange}>
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default function PropertyFilter({ onFilter }: { onFilter: (filters: any) => void }) {
  return (
    <>
      <PropertyFilterForm onFilter={onFilter}>
        {(handleChange, handleSubmit, filters) => (
          <>
            <div className="hidden md:block bg-white p-6 rounded-xl shadow-lg mb-8">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <SelectField
                    label="Purpose"
                    name="purpose"
                    options={["RENT", "BUY"]}
                    onChange={handleChange}
                  />
                  <SelectField
                    label="Property Type"
                    name="propertyType"
                    options={["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL"]}
                    onChange={handleChange}
                  />
                  <SelectField
                    label="Paid Type"
                    name="paidType"
                    options={["YEARLY", "MONTHLY", "WEEKLY", "DAILY"]}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Location"
                    name="location"
                    placeholder="Enter location"
                    onChange={handleChange}
                  />
                  <InputField
                    label="Price Min"
                    name="priceRange.min"
                    type="number"
                    placeholder="Min"
                    onChange={handleChange}
                  />
                  <InputField
                    label="Price Max"
                    name="priceRange.max"
                    type="number"
                    placeholder="Max"
                    onChange={handleChange}
                  />
                  <InputField
                    label="Bedrooms"
                    name="bedrooms"
                    type="number"
                    placeholder="Enter bedrooms"
                    onChange={handleChange}
                  />
                  <InputField
                    label="Bathrooms"
                    name="bathrooms"
                    type="number"
                    placeholder="Enter bathrooms"
                    onChange={handleChange}
                  />
                  <InputField
                    label="Area Min (sqft)"
                    name="area.min"
                    type="number"
                    placeholder="Min"
                    onChange={handleChange}
                  />
                  <InputField
                    label="Area Max (sqft)"
                    name="area.max"
                    type="number"
                    placeholder="Max"
                    onChange={handleChange}
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-4 w-full md:w-auto bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Search
                </Button>
              </form>
            </div>

            <div className="md:hidden gap-3 my-3 flex items-center">
              <div className="relative w-full">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <Input
                  name="name"
                  id="search"
                  placeholder="Search properties..."
                  className="pl-8"
                  onChange={handleChange}
                />
                <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="text-white">
                    <FilterIcon />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="space-y-4">
                      <SelectField
                        label="Purpose"
                        name="purpose"
                        options={["RENT", "BUY"]}
                        onChange={handleChange}
                      />
                      <SelectField
                        label="Property Type"
                        name="propertyType"
                        options={["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL"]}
                        onChange={handleChange}
                      />
                      <SelectField
                        label="Paid Type"
                        name="paidType"
                        options={["YEARLY", "MONTHLY", "WEEKLY", "DAILY"]}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Location"
                        name="location"
                        placeholder="Enter location"
                        onChange={handleChange}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <InputField
                          label="Price Min"
                          name="priceRange.min"
                          type="number"
                          placeholder="Min"
                          onChange={handleChange}
                        />
                        <InputField
                          label="Price Max"
                          name="priceRange.max"
                          type="number"
                          placeholder="Max"
                          onChange={handleChange}
                        />
                      </div>
                      <InputField
                        label="Bedrooms"
                        name="bedrooms"
                        type="number"
                        placeholder="Enter bedrooms"
                        onChange={handleChange}
                      />
                      <InputField
                        label="Bathrooms"
                        name="bathrooms"
                        type="number"
                        placeholder="Enter bathrooms"
                        onChange={handleChange}
                      />
                      <div className="grid grid-cols-2 gap-3 ">
                        <InputField
                          label="Area Min (sqft)"
                          name="area.min"
                          type="number"
                          placeholder="Min"
                          onChange={handleChange}
                        />
                        <InputField
                          label="Area Max (sqft)"
                          name="area.max"
                          type="number"
                          placeholder="Max"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="mt-4 w-full">
                      Search
                    </Button>
                  </form>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </PropertyFilterForm>
    </>
  );
}
