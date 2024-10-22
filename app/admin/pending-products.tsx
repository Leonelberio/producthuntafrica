"use client";

import ProductModalContent from "@/components/product-modal-content";
import ActivateProductModal from "@/components/ui/modals/activate-product-modal";
import ProductModal from "@/components/ui/modals/product-modal";
import RejectProductModal from "@/components/ui/modals/reject-product-modal";
import Image from "next/image";
import { useState } from "react";
import { PiCheckCircle, PiXCircle } from "react-icons/pi";
import ActivateProductModalContent from "./activate-product-modal-content";
import RejectProductModalContent from "./reject-product-modal-content";
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
import { activateProductsBulk } from "@/lib/server-actions";

// Import the server action

interface PendingProductsProps {
  pendingProducts: any;
  authenticatedUser: any;
}

const PendingProducts: React.FC<PendingProductsProps> = ({
  pendingProducts,
  authenticatedUser,
}) => {
  const [currentProduct, setCurrentProduct] = useState<any>(null);

  const [viewProductModalVisible, setViewProductModalVisible] = useState(false);
  const [activateProductModalVisible, setActivateProductModalVisible] =
    useState(false);
  const [rejectProductModalVisible, setRejectProductModalVisible] =
    useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]); // Track selected products
  const [selectAll, setSelectAll] = useState(false); // Track if all are selected

  const formattedProducts = pendingProducts?.map((product: any) => {
    const {
      id,
      name,
      description,
      logo,
    } = product;

    return {
      id,
      name,
      description,
      logo,
    };
  });

  const handleViewProductModal = (product: any) => {
    setCurrentProduct(product);
    setViewProductModalVisible(true);
  };

  const handleActivateProductModal = (product: any) => {
    setCurrentProduct(product);
    setActivateProductModalVisible(true);
  };

  const handleRejectProductModal = (product: any) => {
    setCurrentProduct(product);
    setRejectProductModalVisible(true);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]); // Deselect all products
    } else {
      const allProductIds: string[] = formattedProducts.map((product: { id: string }) => product.id);
      setSelectedProducts(allProductIds); // Select all products
    }
    setSelectAll(!selectAll);
  };

  const handleBulkActivate = async () => {
    try {
      await activateProductsBulk(selectedProducts); // Call the server action
      alert("Selected products have been activated!");
      setSelectedProducts([]); // Clear selected products after activation
      setSelectAll(false); // Reset select all state
    } catch (error) {
      console.error("Error activating products", error);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        {selectedProducts.length > 0 && (
          <button
            onClick={handleBulkActivate}
            className="bg-emerald-500 text-white px-4 py-2 rounded-md"
          >
            Bulk Activate {selectedProducts.length} Products
          </button>
        )}
      </div>

      <div className="flex flex-col w-full my-2 justify-center">
        <Table>
          <TableCaption>A list of pending products.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[100px]">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="">Actions</TableHead>
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
                    width={200}
                    height={200}
                    className="w-10 md:w-20 rounded-md cursor-pointer"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className=" text-gray-500 text-sm">
                  {product.description}
                </TableCell>

                <TableCell className="">
                  <div className="flex items-center gap-2 md:gap-x-4 justify-start align-middle">
                    <button
                      onClick={() => handleViewProductModal(product)}
                      className="bg-[#ff6154] text-white px-4 py-2 text-center text-sm rounded-md"
                    >
                      View Product
                    </button>
                    <button
                      onClick={() => handleActivateProductModal(product)}
                      className="bg-emerald-100 text-white px-4 py-2 text-center text-sm rounded-md"
                    >
                      <PiCheckCircle className="text-xl text-emerald-500" />
                    </button>
                    <button
                      onClick={() => handleRejectProductModal(product)}
                      className="bg-red-100 text-white px-4 py-2 text-center text-sm rounded-md"
                    >
                      <PiXCircle className="text-xl text-red-500" />
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

        <ActivateProductModal
          visible={activateProductModalVisible}
          setVisible={setActivateProductModalVisible}
        >
          <ActivateProductModalContent
            currentProduct={currentProduct}
            closeModal={() => setActivateProductModalVisible(false)}
          />
        </ActivateProductModal>

        <RejectProductModal
          visible={rejectProductModalVisible}
          setVisible={setRejectProductModalVisible}
        >
          <RejectProductModalContent
            currentProduct={currentProduct}
            closeModal={() => setRejectProductModalVisible(false)}
          />
        </RejectProductModal>
      </div>
    </div>
  );
};

export default PendingProducts;
