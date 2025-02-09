import React from "react";

export default function SortDropdown() {
  return (
    <select className="p-2 border rounded-lg">
      <option>Sort By: Default</option>
      <option>Price: Low to High</option>
      <option>Price: High to Low</option>
    </select>
  );
}
