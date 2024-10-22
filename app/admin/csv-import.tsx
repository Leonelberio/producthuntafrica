"use client";

import { useState } from "react";
import Papa from "papaparse";
import PendingProducts from "./pending-products";
import { ImagesUploader } from "@/components/images-uploader";
import { LogoUploader } from "@/components/logo-uploader";
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
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
}

interface CsvImportProps {
  initialPendingProducts: any[];
  authenticatedUser: any;
  categories: Category[];
}

const CsvImport: React.FC<CsvImportProps> = ({ initialPendingProducts, authenticatedUser, categories }) => {
  const [pendingProducts, setPendingProducts] = useState(initialPendingProducts);
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
            categories: product.categories ? product.categories.split(";").map((cat: string) => cat.trim()) : [],
            rank: product.rank || 0, // Ensure rank is included, defaulting to 0 if missing
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

  // Handle category selection with a max of 3 categories
  const handleCategoryChange = (index: number, selectedCategory: string) => {
    const updatedProducts = [...csvProducts];
    const productCategories = updatedProducts[index].categories || [];

    if (productCategories.includes(selectedCategory)) {
      updatedProducts[index].categories = productCategories.filter(
        (category: string) => category !== selectedCategory
      );
    } else if (productCategories.length < 3) {
      updatedProducts[index].categories = [...productCategories, selectedCategory];
    } else {
      alert("You can only select a maximum of 3 categories.");
    }

    setCsvProducts(updatedProducts);
  };

  // Remove a category from a product
  const handleRemoveCategory = (index: number, categoryToRemove: string) => {
    const updatedProducts = [...csvProducts];
    updatedProducts[index].categories = updatedProducts[index].categories.filter(
      (category: string) => category !== categoryToRemove
    );
    setCsvProducts(updatedProducts);
  };

  // Remove a product row
  const handleRemoveRow = (index: number) => {
    const updatedProducts = csvProducts.filter((_, i) => i !== index);
    setCsvProducts(updatedProducts);
  };

  // Handle bulk import to server
  const handleBulkImport = async () => {
    const validatedProducts = csvProducts.map((product) => ({
      ...product,
      // images: product.images || [],
      // categories: product.categories || [],
      // rank: product.rank || 0, // Ensure rank is passed when importing
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
                <TableHead>Rank</TableHead> {/* Added Rank column */}
                <TableHead>Logo</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>Actions</TableHead>
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
                    <input
                      type="number"
                      value={product.rank}
                      onChange={(e) => handleFieldChange(index, "rank", e.target.value)}
                      className="border px-2 py-1"
                    />
                  </TableCell> {/* Rank field */}
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
                    <Select onValueChange={(value) => handleCategoryChange(index, value)}>
                      <SelectTrigger className="border px-2 py-1">
                        <SelectValue placeholder="Select Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id} // Correct usage of category object
                              value={category.name} // Using category name for value
                              disabled={product.categories.length >= 3 && !product.categories.includes(category.name)}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.categories?.map((cat: string, catIndex: number) => (
                        <span key={catIndex} className="border px-2 py-1 rounded-md bg-gray-100 flex items-center">
                          {cat}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="ml-2"
                            onClick={() => handleRemoveCategory(index, cat)}
                          >
                            X
                          </Button>
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
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveRow(index)}>
                      Remove Row
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={10}>
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
