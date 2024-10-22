"use client";

import ProductModalContent from "@/components/product-modal-content";
import ProductModal from "@/components/ui/modals/product-modal";
import Image from "next/image";
import { useState } from "react";
import { PiTrash } from "react-icons/pi";
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
  const [csvProducts, setCsvProducts] = useState<any[]>([]);


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
      createdAt,
      updatedAt,
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
      createdAt,
      updatedAt,
      userId,
      status,
      images: imageUrls,
      categories: categoryNames,
    };
  });

  const handleViewProductModal = (product: any) => {
    const formattedProduct = formattedProducts.find(
      (formattedProduct: any) => formattedProduct.id === product.id
    );
    setCurrentProduct(formattedProduct);
    setViewProductModalVisible(true);
  };

  const handleDeleteProduct = async (productId: any) => {
    console.log(`Deleting product with id: ${productId}`);
    const updatedProducts = formattedProducts.filter((product: any) => product.id !== productId);
    setCurrentProduct(updatedProducts);
    setDeleteProductModalVisible(false);
  };

  const handleConfirmDelete = (product: any) => {
    setProductToDelete(product);
    setDeleteProductModalVisible(true);
  };

  

  return (
    <div>
     

      <div className="flex flex-col w-full my-6">
        {formattedProducts?.map((product: any) =>  (
          <Table>
            <TableCaption>Active Products</TableCaption>
            <TableHeader>
              <TableRow key={product.id}>
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
        ))}

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
