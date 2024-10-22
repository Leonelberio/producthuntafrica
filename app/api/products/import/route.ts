import { NextResponse } from "next/server";
import { bulkImportProducts } from "@/lib/server-actions";  // Your server-side logic

// This function will handle the POST request
export async function POST(req: Request) {
  try {
    // Get the request body
    const body = await req.json();
    const { products } = body;

    // Validate if products array exists
    if (!Array.isArray(products)) {
      return NextResponse.json({ success: false, message: "Invalid product data" }, { status: 400 });
    }

    // Call the bulk import logic
    const result = await bulkImportProducts(products);

    // Return success response
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// Optional: Handle unsupported methods (GET, DELETE, PUT, etc.)
export function GET() {
  return NextResponse.json({ success: false, message: "Method GET not allowed" }, { status: 405 });
}
