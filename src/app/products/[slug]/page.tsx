import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";
import { getProductBySlug } from "@/lib/products/repository";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
