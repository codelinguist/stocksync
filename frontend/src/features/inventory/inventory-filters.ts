import type { Product } from "@/lib/services/api";

export type StockStatusFilter = "all" | "in-stock" | "out-of-stock";

type InventoryFilters = {
  search: string;
  vendor: string;
  stockStatus: StockStatusFilter;
};

export function filterProducts(
  products: Product[],
  { search, vendor, stockStatus }: InventoryFilters,
) {
  const normalizedSearch = search.trim().toLowerCase();

  return products.filter((product) => {
    const matchesSearch =
      !normalizedSearch ||
      product.sku.toLowerCase().includes(normalizedSearch) ||
      product.name.toLowerCase().includes(normalizedSearch);
    const matchesVendor = !vendor || product.vendor === vendor;
    const matchesStockStatus =
      stockStatus === "all" ||
      (stockStatus === "in-stock" && product.stockQuantity > 0) ||
      (stockStatus === "out-of-stock" && product.stockQuantity === 0);

    return matchesSearch && matchesVendor && matchesStockStatus;
  });
}
