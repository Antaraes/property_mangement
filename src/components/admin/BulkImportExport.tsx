"use client";

import { FC, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/server/client";
import toast from "react-hot-toast";
import { Upload, Download, FileJson, FileSpreadsheet, X } from "lucide-react";

interface BulkImportExportProps {
  onImportSuccess?: () => void;
  properties?: any[];
}

const BulkImportExport: FC<BulkImportExportProps> = ({
  onImportSuccess,
  properties = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importData, setImportData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const bulkImportMutation = trpc.property.bulkImport.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully imported ${data.count} properties!`);
      utils.property.getMyProperties.invalidate();
      setIsModalOpen(false);
      setImportData(null);
      onImportSuccess?.();
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let data;

        if (file.name.endsWith(".json")) {
          data = JSON.parse(text);
        } else if (file.name.endsWith(".csv")) {
          // Simple CSV parser
          const lines = text.split("\n");
          const headers = lines[0].split(",").map((h) => h.trim());
          data = lines.slice(1).map((line) => {
            const values = line.split(",");
            const obj: any = {};
            headers.forEach((header, index) => {
              const value = values[index]?.trim();
              // Convert numeric fields
              if (["price", "bedrooms", "bathrooms", "area"].includes(header)) {
                obj[header] = parseFloat(value);
              } else if (header === "images") {
                obj[header] = value ? value.split("|") : [];
              } else {
                obj[header] = value;
              }
            });
            return obj;
          });
        }

        // Validate data structure
        if (Array.isArray(data)) {
          setImportData(data);
          toast.success(`Loaded ${data.length} properties from file`);
        } else if (data && typeof data === "object" && Array.isArray(data.properties)) {
          setImportData(data.properties);
          toast.success(`Loaded ${data.properties.length} properties from file`);
        } else {
          toast.error("Invalid file format. Expected an array of properties.");
        }
      } catch (error) {
        toast.error("Failed to parse file. Please check the format.");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importData || importData.length === 0) {
      toast.error("No data to import");
      return;
    }

    bulkImportMutation.mutate({ properties: importData });
  };

  const exportAsJSON = () => {
    if (properties.length === 0) {
      toast.error("No properties to export");
      return;
    }

    // Remove system fields
    const exportData = properties.map((p) => ({
      name: p.name,
      location: p.location,
      price: p.price,
      description: p.description,
      images: p.images,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      purpose: p.purpose,
      paidType: p.paidType,
      propertyType: p.propertyType,
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `properties_export_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success(`Exported ${exportData.length} properties as JSON`);
  };

  const exportAsCSV = () => {
    if (properties.length === 0) {
      toast.error("No properties to export");
      return;
    }

    // CSV headers
    const headers = [
      "name",
      "location",
      "price",
      "description",
      "images",
      "bedrooms",
      "bathrooms",
      "area",
      "purpose",
      "paidType",
      "propertyType",
    ];

    // CSV rows
    const csvContent = [
      headers.join(","),
      ...properties.map((p) =>
        [
          `"${p.name}"`,
          `"${p.location}"`,
          p.price,
          `"${p.description}"`,
          `"${p.images.join("|")}"`,
          p.bedrooms,
          p.bathrooms,
          p.area,
          p.purpose,
          p.paidType,
          p.propertyType,
        ].join(",")
      ),
    ].join("\n");

    const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    const exportFileDefaultName = `properties_export_${new Date().toISOString().split("T")[0]}.csv`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success(`Exported ${properties.length} properties as CSV`);
  };

  const downloadSampleJSON = () => {
    const sampleData = [
      {
        name: "Luxury Downtown Apartment",
        location: "New York, NY",
        price: 2500,
        description: "Beautiful 2-bedroom apartment in the heart of downtown",
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858",
        ],
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        purpose: "RENT",
        paidType: "MONTHLY",
        propertyType: "APARTMENT",
      },
      {
        name: "Spacious Family Villa",
        location: "Los Angeles, CA",
        price: 850000,
        description: "Stunning 4-bedroom villa with pool and garden",
        images: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        ],
        bedrooms: 4,
        bathrooms: 3,
        area: 3500,
        purpose: "BUY",
        paidType: "MONTHLY",
        propertyType: "VILLA",
      },
    ];

    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "properties_template.json");
    linkElement.click();

    toast.success("Downloaded sample JSON template");
  };

  return (
    <>
      {/* Trigger Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button
          variant="outline"
          onClick={exportAsJSON}
          disabled={properties.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Import Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Bulk Import Properties</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setImportData(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Import Instructions
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Upload a JSON or CSV file with property data</li>
                  <li>JSON should be an array of property objects</li>
                  <li>CSV should have headers matching property fields</li>
                  <li>Download the sample template to see the required format</li>
                </ul>
              </div>

              {/* Sample Template Download */}
              <div>
                <Button
                  variant="outline"
                  onClick={downloadSampleJSON}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <FileJson className="h-4 w-4" />
                  Download Sample JSON Template
                </Button>
              </div>

              {/* File Upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose File (JSON or CSV)
                </Button>
              </div>

              {/* Preview */}
              {importData && importData.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2">
                    Preview ({importData.length} properties)
                  </h3>
                  <div className="max-h-60 overflow-y-auto">
                    <pre className="text-xs bg-white p-3 rounded border">
                      {JSON.stringify(importData.slice(0, 3), null, 2)}
                      {importData.length > 3 && "\n... and more"}
                    </pre>
                  </div>
                </div>
              )}

              {/* Export Options */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Export Current Properties</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={exportAsJSON}
                    disabled={properties.length === 0}
                    className="flex items-center justify-center gap-2"
                  >
                    <FileJson className="h-4 w-4" />
                    Export as JSON
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportAsCSV}
                    disabled={properties.length === 0}
                    className="flex items-center justify-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export as CSV
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setImportData(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!importData || importData.length === 0 || bulkImportMutation.isLoading}
                  className="flex-1"
                >
                  {bulkImportMutation.isLoading
                    ? "Importing..."
                    : `Import ${importData?.length || 0} Properties`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkImportExport;
