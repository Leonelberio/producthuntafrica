"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner"; // For notifications
import { addCategory } from "@/lib/server-actions"; // Import the server action

interface Category {
  id: string;
  name: string;
}

interface AddCategoryClientProps {
  // Initial categories to display, categories is array of Category objects
  initialCategories: Category[];
}

const AddCategoryClient: React.FC<AddCategoryClientProps> = ({ initialCategories }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategory, setNewCategory] = useState<string>("");
  const [isPending, startTransition] = useTransition(); // To handle server transitions

  const handleAddCategory = async () => {
    if (newCategory.trim() && !categories.some((cat) => cat.name.toLowerCase() === newCategory.toLowerCase())) {
      startTransition(async () => {
        try {
          const addedCategory = await addCategory(newCategory); // Call server action
          setCategories([...categories, { id: addedCategory.id, name: addedCategory.name }]);
          setNewCategory(""); // Clear input after adding
          toast.success("Category added successfully!");
        } catch (error: any) {
          toast.error(error.message || "Error adding category.");
        }
      });
    } else {
      toast.error("Category is either empty or already exists.");
    }
  };

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>Add New Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter new category"
            className="w-full"
          />
          <Button onClick={handleAddCategory} disabled={isPending}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </div>

        {/* Display updated categories */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Categories</h2>
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-2">
            {categories.map((category: Category) => (
              <span key={category.id} className="border px-3 py-1 rounded-md bg-gray-100">
                {category.name}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddCategoryClient;
