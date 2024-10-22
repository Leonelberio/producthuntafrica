import { NextRequest, NextResponse } from 'next/server';
import { createProduct } from '@/lib/server-actions';

export async function POST(req: NextRequest) {
  const { products } = await req.json();

  try {
    const createdProducts = await Promise.all(products.map((productData: any) => createProduct(productData)));
    return NextResponse.json({ message: 'Produits importés avec succès', products: createdProducts }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de l\'importation des produits', error);
    return NextResponse.json({ error: 'Erreur lors de l\'importation des produits' }, { status: 500 });
  }
}