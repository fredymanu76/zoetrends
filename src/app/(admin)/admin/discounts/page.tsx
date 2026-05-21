"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { formatPence } from "@/lib/utils";
import type { Discount, DiscountType } from "@/types";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<DiscountType>("percentage");
  const [value, setValue] = useState("");
  const [minOrderPounds, setMinOrderPounds] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [saving, setSaving] = useState(false);

  function getToken() {
    return sessionStorage.getItem("admin_token") || "";
  }

  useEffect(() => {
    fetchDiscounts();
  }, []);

  async function fetchDiscounts() {
    const res = await fetch("/api/discounts", {
      headers: { "x-admin-password": getToken() },
    });
    if (res.ok) {
      setDiscounts(await res.json());
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      code,
      type,
      value: type === "percentage" ? parseFloat(value) : Math.round(parseFloat(value) * 100),
      minimumOrderPence: minOrderPounds
        ? Math.round(parseFloat(minOrderPounds) * 100)
        : null,
      maxUses: maxUses ? parseInt(maxUses) : null,
      active: true,
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(validUntil).toISOString(),
    };

    const res = await fetch("/api/discounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": getToken(),
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowForm(false);
      setCode("");
      setValue("");
      setMinOrderPounds("");
      setMaxUses("");
      setValidFrom("");
      setValidUntil("");
      fetchDiscounts();
    }
    setSaving(false);
  }

  async function toggleActive(d: Discount) {
    await fetch(`/api/discounts/${d.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": getToken(),
      },
      body: JSON.stringify({ active: !d.active }),
    });
    fetchDiscounts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this discount code?")) return;
    await fetch(`/api/discounts/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": getToken() },
    });
    fetchDiscounts();
  }

  return (
    <AdminShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-charcoal">Discounts</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gold text-black text-sm font-semibold rounded-lg hover:bg-gold-light transition-colors"
          >
            {showForm ? "Cancel" : "Add Discount"}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-lg border border-gray-200 p-4 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  placeholder="WELCOME10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as DiscountType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Value {type === "percentage" ? "(%)" : "(£)"}
                </label>
                <input
                  type="number"
                  step={type === "percentage" ? "1" : "0.01"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Min Order (£){" "}
                  <span className="text-charcoal/50">optional</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={minOrderPounds}
                  onChange={(e) => setMinOrderPounds(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Max Uses{" "}
                  <span className="text-charcoal/50">optional</span>
                </label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Valid From
                </label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gold"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-gold text-black text-sm font-semibold rounded-lg hover:bg-gold-light disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Discount"}
            </button>
          </form>
        )}

        {/* Discounts list */}
        {loading ? (
          <p className="text-charcoal/60">Loading...</p>
        ) : discounts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-charcoal/60">No discount codes yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Code
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Discount
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Min Order
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Uses
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-charcoal/70">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-charcoal/70">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {discounts.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium">
                        {d.code}
                      </td>
                      <td className="px-4 py-3">
                        {d.type === "percentage"
                          ? `${d.value}%`
                          : formatPence(d.value)}
                      </td>
                      <td className="px-4 py-3 text-charcoal/60">
                        {d.minimumOrderPence
                          ? formatPence(d.minimumOrderPence)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {d.currentUses}
                        {d.maxUses ? ` / ${d.maxUses}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            d.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {d.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => toggleActive(d)}
                          className="text-gold hover:text-gold-dark text-xs font-medium"
                        >
                          {d.active ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
