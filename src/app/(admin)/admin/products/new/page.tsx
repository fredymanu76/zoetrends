"use client";

import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <AdminShell>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-charcoal">Add Product</h2>
        <ProductForm />
      </div>
    </AdminShell>
  );
}
