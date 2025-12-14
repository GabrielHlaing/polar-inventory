// src/utils/sampleInvoice.js
export const sampleInvoice = {
  invoice_number: "SAMPLE-001",
  created_at: new Date().toISOString(),
  type: "sale",
  customer: {
    name: "Customer",
    phone: "09xxxxxxxxx",
    address: "The City",
  },

  history: [
    {
      id: 1,
      qty_change: 2,
      sale_price: 1500,
      purchase_price: 1200,
      metadata: { name: "Sample Item A" },
    },
    {
      id: 2,
      qty_change: 1,
      sale_price: 3000,
      purchase_price: 2500,
      metadata: { name: "Sample Item B" },
    },
  ],
};
