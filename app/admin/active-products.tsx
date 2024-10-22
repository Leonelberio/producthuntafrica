"use client";

import ProductModalContent from "@/components/product-modal-content";
import ProductModal from "@/components/ui/modals/product-modal";
import Image from "next/image";
import { useState } from "react";
import { PiTrash } from "react-icons/pi";
import { bulkDeleteProducts, deleteProduct } from "@/lib/server-actions"; // Import server actions
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

interface ActiveProductsProps {
  activeProducts: any;
  authenticatedUser: any;
}

const ActiveProducts: React.FC<ActiveProductsProps> = ({
  activeProducts,
  authenticatedUser,
}) => {
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [viewProductModalVisible, setViewProductModalVisible] = useState(false);
  const [deleteProductModalVisible, setDeleteProductModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]); // For bulk delete
  const [selectAll, setSelectAll] = useState(false); // Track select all state

  const formattedProducts = activeProducts?.map((product: any) => {
    const {
      id,
      name,
      slug,
      headline,
      description,
      logo,
      releaseDate,
      website,
      twitter,
      discord,
      userId,
      status,
      images,
      categories,
    } = product;

    const imageUrls = images.map((image: any) => image.url);
    const categoryNames = categories.map((category: any) => category.name);

    return {
      id,
      name,
      slug,
      headline,
      description,
      logo,
      releaseDate,
      website,
      twitter,
      discord,
      userId,
      status,
      images: imageUrls,
      categories: categoryNames,
    };
  });

  // Single product delete handler
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId); // Call the server action to delete
      const updatedProducts = formattedProducts.filter((product: any) => product.id !== productId);
      setCurrentProduct(updatedProducts);
      setDeleteProductModalVisible(false);
      alert(`Product with id: ${productId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product. Please try again.");
    }
  };

  // Confirm delete for a single product
  const handleConfirmDelete = (product: any) => {
    setProductToDelete(product);
    setDeleteProductModalVisible(true);
  };

  // Handle product selection for bulk delete
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  // Select or deselect all products
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]); // Deselect all products
    } else {
      const allProductIds: string[] = formattedProducts.map((product: any) => product.id);
      setSelectedProducts(allProductIds); // Select all products
    }
    setSelectAll(!selectAll);
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    try {
      await bulkDeleteProducts(selectedProducts); // Call the server action for bulk delete
      const updatedProducts = formattedProducts.filter(
        (product: any) => !selectedProducts.includes(product.id)
      );
      setCurrentProduct(updatedProducts); // Update the UI
      setSelectedProducts([]); // Clear selected products after deletion
      setSelectAll(false); // Reset the select all checkbox
      alert("Selected products have been deleted.");
    } catch (error) {
      console.error("Error deleting products:", error);
      alert("Error deleting products. Please try again.");
    }
  };

  const handleViewProductModal = (product: any) => {
    setCurrentProduct(product);
    setViewProductModalVisible(true);
  };
  return (
    <div>
      {/* Bulk delete button */}
      <div className="flex justify-end mb-4">
        {selectedProducts.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Delete {selectedProducts.length} Selected Products
          </button>
        )}
      </div>

      <div className="flex flex-col w-full my-6">
        <Table>
          <TableCaption>Active Products</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedProducts?.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                </TableCell>
                <TableCell>
                  <Image
                    src={product.logo}
                    alt="logo"
                    width={50}
                    height={50}
                    className="w-10 md:w-20 rounded-md cursor-pointer"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.releaseDate}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 md:gap-x-4 justify-center">
                    <button
                      onClick={() => handleViewProductModal(product)}
                      className="bg-[#ff6154] text-white px-4 py-2 text-center text-sm rounded-md"
                    >
                      View Product
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(product)}
                      className="bg-red-100 text-white px-4 py-2 text-center text-sm rounded-md"
                    >
                      <PiTrash className="text-xl text-red-500" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <ProductModal
          visible={viewProductModalVisible}
          setVisible={setViewProductModalVisible}
        >
          <ProductModalContent
            currentProduct={currentProduct}
            authenticatedUser={authenticatedUser}
            hasUpvoted={false}
            totalUpvotes={0}
            setTotalUpvotes={() => {}}
            setHasUpvoted={() => {}}
          />
        </ProductModal>

        {deleteProductModalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md">
              <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
              <p>Are you sure you want to delete this product?</p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setDeleteProductModalVisible(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProduct(productToDelete.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProducts;
