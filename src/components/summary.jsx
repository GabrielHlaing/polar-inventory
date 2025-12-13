export default function getMonthlySummary(invoices) {
  let totalSales = 0;
  let totalPurchase = 0;

  for (let inv of invoices) {
    if (inv.type === "sale") totalSales += inv.total_amount;
    else totalPurchase += inv.total_amount;
  }

  return { totalSales, totalPurchase };
}
