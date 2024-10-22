import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Assuming you have a `db` object for Prisma

export async function POST(request: Request) {
  const { name } = await request.json();

  if (!name || name.trim() === "") {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  try {
    // Add the category to the database
    const category = await db.category.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
  }
}
