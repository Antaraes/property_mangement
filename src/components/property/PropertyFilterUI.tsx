import { Button } from "../ui/button";
import { InputField, SelectField } from "./PropertyFilter";
import PropertyFilterForm from "./PropertyFilterForm";

export default function PropertyFilterUI({ onFilter }: { onFilter: (filters: any) => void }) {
  return (
    <PropertyFilterForm onFilter={onFilter}>
      {(handleChange, handleSubmit, filters) => (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col md:flex-row gap-4 items-end"
        >
          <InputField
            label="Price Min"
            name="priceRange.min"
            type="number"
            placeholder="Min"
            onChange={handleChange}
          />

          <InputField
            label="Location"
            name="location"
            placeholder="Enter location"
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
          <Button type="submit">Search</Button>
        </form>
      )}
    </PropertyFilterForm>
  );
}
