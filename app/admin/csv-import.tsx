"use client";

import { useState } from "react";
import Papa from "papaparse";
import PendingProducts from "./pending-products";
import { ImagesUploader } from "@/components/images-uploader"; // Import ImagesUploader
import { LogoUploader } from "@/components/logo-uploader"; // Import LogoUploader
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CsvImportProps {
  initialPendingProducts: any[];
  authenticatedUser: any;
  categories: any[]; // Accept categories from the parent
}

const CsvImport: React.FC<CsvImportProps> = ({ initialPendingProducts, authenticatedUser, categories }) => {
  const [pendingProducts, setPendingProducts] = useState(initialPendingProducts); // Manage client-side pending products
  const [csvProducts, setCsvProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle CSV upload and parsing
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      Papa.parse(file, {
        header: true,
        complete: (results: any) => {
          const products = results.data;
          const formattedProducts = products.map((product: any) => ({
            name: product.name,
            slug: product.slug,
            headline: product.headline,
            description: product.description,
            logo: product.logo,
            releaseDate: product.releaseDate,
            website: product.website,
            twitter: product.twitter,
            discord: product.discord,
            images: product.images ? product.images.split(";").map((url: string) => url.trim()) : [],
            categories: product.categories.split(";"),
          }));
          setCsvProducts(formattedProducts);
          setLoading(false);
        },
      });
    }
  };

  // Handle inline field changes for CSV products
  const handleFieldChange = (index: number, field: string, value: any) => {
    const updatedProducts = [...csvProducts];
    updatedProducts[index][field] = value;
    setCsvProducts(updatedProducts);
  };

  // Handle image uploads for each product
  const handleImagesUpload = (index: number, urls: string[]) => {
    const updatedProducts = [...csvProducts];
    updatedProducts[index].images = urls;
    setCsvProducts(updatedProducts);
  };

  // Handle logo uploads for each product
  const handleLogoUpload = (index: number, url: string) => {
    const updatedProducts = [...csvProducts];
    updatedProducts[index].logo = url;
    setCsvProducts(updatedProducts);
  };

  // Handle category selection
  const handleCategoryChange = (index: number, selectedCategory: string) => {
    const updatedProducts = [...csvProducts];
    const productCategories = updatedProducts[index].categories || [];

    // Toggle category selection
    if (productCategories.includes(selectedCategory)) {
      updatedProducts[index].categories = productCategories.filter(
        (category: string) => category !== selectedCategory
      );
    } else {
      updatedProducts[index].categories = [...productCategories, selectedCategory];
    }
    setCsvProducts(updatedProducts);
  };

  // Handle bulk import to server
  const handleBulkImport = async () => {
    const validatedProducts = csvProducts.map((product) => ({
      ...product,
      images: product.images || [],
      categories: product.categories || [],
    }));

    try {
      const response = await fetch("/api/products/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products: validatedProducts }),
      });
      if (response.ok) {
        // Update the pending products after a successful import
        setPendingProducts((prevPendingProducts) => [
          ...prevPendingProducts,
          ...validatedProducts,
        ]);
        setCsvProducts([]); // Clear the CSV data after import
      } else {
        console.error("Error importing products");
      }
    } catch (error) {
      console.error("Error importing products", error);
    }
  };

  return (
    <div className="my-4">
      <h2 className="text-2xl font-bold">Bulk Import Products</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {loading && <p>Loading...</p>}

      {csvProducts.length > 0 && (
        <div style={{ maxWidth: "95vw" }}>
          <Table>
            <TableCaption>Imported CSV Products</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Release Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                      className="border px-2 py-1"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      value={product.slug}
                      onChange={(e) => handleFieldChange(index, "slug", e.target.value)}
                      className="border px-2 py-1"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      value={product.headline}
                      onChange={(e) => handleFieldChange(index, "headline", e.target.value)}
                      className="border px-2 py-1"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      value={product.description}
                      onChange={(e) => handleFieldChange(index, "description", e.target.value)}
                      className="border px-2 py-1"
                    />
                  </TableCell>
                  <TableCell>
                    {product.logo ? (
                      <img src={product.logo} alt="logo" width={50} />
                    ) : (
                      <LogoUploader
                        endpoint="productLogo"
                        onChange={(url: string | undefined) => url && handleLogoUpload(index, url)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <ImagesUploader
                      endpoint="productImages"
                      onChange={(urls) => handleImagesUpload(index, urls)}
                    />
                    <div className="flex flex-wrap gap-1">
                      {product.images?.map((img: any, imgIndex: number) => (
                        <img
                          key={imgIndex}
                          src={img}
                          alt={`image-${imgIndex}`}
                          width={30}
                          height={30}
                          className="rounded-md"
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* Wrapping SelectTrigger inside Select */}
                    <Select onValueChange={(value) => handleCategoryChange(index, value)}>
                      <SelectTrigger className="border px-2 py-1">
                        <SelectValue placeholder="Select Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.name}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1">
                      {product.categories?.map((cat: string, catIndex: number) => (
                        <span key={catIndex} className="border px-2 py-1 rounded-md">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      value={product.releaseDate}
                      onChange={(e) => handleFieldChange(index, "releaseDate", e.target.value)}
                      className="border px-2 py-1"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={8}>
                  <button
                    onClick={handleBulkImport}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Bulk Import
                  </button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}

      {/* Render the updated pending products */}
      <div className="pb-10 space-y-10">
        <h1 className="text-2xl font-bold">Pending Products</h1>
        <PendingProducts pendingProducts={pendingProducts} authenticatedUser={authenticatedUser} />
      </div>
    </div>
  );
};

export default CsvImport;
