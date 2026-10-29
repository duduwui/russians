import { PrismaClient, Role, PrinterType, QuotationStatus, PurchaseStatus, TransferStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "./../lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting expanded database seed with rich retail data...");

  // 1. Settings
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "FreshCart Store 01",
      storeNameKu: "فرێش کارت فرۆشگای ٠١",
      storeAddress: "100m Street, Erbil, Kurdistan",
      storePhone: "+964 750 123 4567",
      receiptFooter: "Thank you for shopping with FreshCart! / سوپاس بۆ سەردانەکەتان!",
      printerAdapter: PrinterType.MOCK,
      taxRate: 5.0,
      currency: "USD",
    },
  });

  // 2. Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const cashierPassword = await bcrypt.hash("cashier123", 10);

  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      name: "Admin Manager",
      password: adminPassword,
      role: Role.ADMIN,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { username: "cashier" },
    update: {},
    create: {
      username: "cashier",
      name: "Sarah Ayu Safitri",
      password: cashierPassword,
      role: Role.CASHIER,
      active: true,
    },
  });

  // 3. Categories
  const categoryMap = new Map<string, string>();
  for (const cat of MOCK_CATEGORIES) {
    if (cat.slug === "all") continue;
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        nameKu: cat.nameKu,
        slug: cat.slug,
        icon: cat.icon,
      },
    });
    categoryMap.set(cat.id, created.id);
  }

  // 4. Products (36 Products)
  const productRecordMap = new Map<string, string>();
  for (const p of MOCK_PRODUCTS) {
    const categoryId = categoryMap.get(p.categoryId) || Array.from(categoryMap.values())[0];
    const created = await prisma.product.upsert({
      where: { barcode: p.barcode },
      update: {
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        minStockAlert: p.minStockAlert,
        image: p.image,
      },
      create: {
        name: p.name,
        nameKu: p.nameKu,
        barcode: p.barcode,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        minStockAlert: p.minStockAlert,
        image: p.image,
        categoryId: categoryId,
      },
    });
    productRecordMap.set(p.barcode, created.id);
  }
  console.log("✓ Seeded Products:", MOCK_PRODUCTS.length);

  // 5. Customers (12 Customers)
  const customersData = [
    { code: "CUST-001", name: "Tajmul", nameKu: "تاجمل", phone: "+964 750 111 2233", totalSpent: 2850.0, dueBalance: 0.0 },
    { code: "CUST-002", name: "Najmul Hossain", nameKu: "نەجمل حوسێن", phone: "+964 750 222 3344", totalSpent: 1940.0, dueBalance: 400.0 },
    { code: "CUST-003", name: "Karwan Ahmed", nameKu: "کاروان ئەحمەد", phone: "+964 750 333 4455", totalSpent: 1150.0, dueBalance: 150.0 },
    { code: "CUST-004", name: "Soran Mohammed", nameKu: "سۆران محەمەد", phone: "+964 750 444 5566", totalSpent: 3400.0, dueBalance: 0.0 },
    { code: "CUST-005", name: "Walk-in Customer", nameKu: "موشتەری ڕێبوار", phone: "-", totalSpent: 8500.0, dueBalance: 0.0 },
    { code: "CUST-006", name: "Dilan Barzan", nameKu: "دیلان بارزان", phone: "+964 750 555 6677", totalSpent: 720.0, dueBalance: 80.0 },
    { code: "CUST-007", name: "Rebaz Qadir", nameKu: "ڕێباز قادر", phone: "+964 750 666 7788", totalSpent: 1450.0, dueBalance: 0.0 },
    { code: "CUST-008", name: "Aram Othman", nameKu: "ئارام عوسمان", phone: "+964 750 777 8899", totalSpent: 2100.0, dueBalance: 250.0 },
    { code: "CUST-009", name: "Shvan Mustafa", nameKu: "شڤان مستەفا", phone: "+964 750 888 9900", totalSpent: 980.0, dueBalance: 0.0 },
    { code: "CUST-010", name: "Bnar Hawleri", nameKu: "بنار هەولێری", phone: "+964 750 999 0011", totalSpent: 3120.0, dueBalance: 120.0 },
  ];

  for (const c of customersData) {
    await prisma.customer.upsert({
      where: { code: c.code },
      update: { totalSpent: c.totalSpent, dueBalance: c.dueBalance },
      create: c,
    });
  }
  console.log("✓ Seeded Customers:", customersData.length);

  // 6. Suppliers (8 Suppliers)
  const suppliersData = [
    { code: "SUP-001", name: "Kurdistan Agro Farm", company: "Kurdistan Agro LLC", phone: "+964 750 999 1111", balanceDue: 550.0 },
    { code: "SUP-002", name: "Atlantic Fisheries Ltd", company: "Atlantic Marine Imports", phone: "+964 750 888 2222", balanceDue: 950.0 },
    { code: "SUP-003", name: "Organic Dairy Co.", company: "Organic Dairy Farm", phone: "+964 750 777 3333", balanceDue: 0.0 },
    { code: "SUP-004", name: "Premium Beverage Bottling", company: "Beverage Bottling Corp", phone: "+964 750 666 4444", balanceDue: 320.0 },
    { code: "SUP-005", name: "Royal Bakery Mills", company: "Kurdistan Flour & Bakery", phone: "+964 750 555 5555", balanceDue: 180.0 },
    { code: "SUP-006", name: "Golden Meat Wholesalers", company: "Halal Livestock Corp", phone: "+964 750 444 6666", balanceDue: 1200.0 },
    { code: "SUP-007", name: "Highland Fruits Cooperative", company: "Mountain Harvest Ltd", phone: "+964 750 333 7777", balanceDue: 410.0 },
  ];

  const supplierMap = new Map<string, string>();
  for (const s of suppliersData) {
    const created = await prisma.supplier.upsert({
      where: { code: s.code },
      update: { balanceDue: s.balanceDue },
      create: s,
    });
    supplierMap.set(s.code, created.id);
  }
  console.log("✓ Seeded Suppliers:", suppliersData.length);

  // 7. Quotations (6 Quotations)
  const quotesData = [
    {
      num: "QTN/2019/06/0012",
      client: "Grand Hypermarket",
      phone: "+964 750 555 1234",
      total: 1450.0,
      st: QuotationStatus.PENDING,
      item: "Fresh Red Apple",
      price: 12.0,
      qty: 120,
    },
    {
      num: "QTN/2019/06/0011",
      client: "Erbil Fresh Market",
      phone: "+964 750 666 2345",
      total: 850.0,
      st: QuotationStatus.ACCEPTED,
      item: "Premium Beef Ribeye Steak 1Kg",
      price: 28.0,
      qty: 30,
    },
    {
      num: "QTN/2019/06/0010",
      client: "Royal Bakery Cafe",
      phone: "+964 750 777 3456",
      total: 620.0,
      st: QuotationStatus.EXPIRED,
      item: "French Butter Croissants 4pcs",
      price: 6.5,
      qty: 95,
    },
    {
      num: "QTN/2019/06/0009",
      client: "City Mart Superstore",
      phone: "+964 750 888 4567",
      total: 2100.0,
      st: QuotationStatus.ACCEPTED,
      item: "Basmati Premium Rice 5Kg",
      price: 21.0,
      qty: 100,
    },
    {
      num: "QTN/2019/06/0008",
      client: "Kurdish Grill Restaurant",
      phone: "+964 750 999 5678",
      total: 1800.0,
      st: QuotationStatus.CONVERTED,
      item: "Ground Beef Minced 1Kg",
      price: 18.0,
      qty: 100,
    },
  ];

  for (const q of quotesData) {
    await prisma.quotation.upsert({
      where: { quoteNumber: q.num },
      update: {},
      create: {
        quoteNumber: q.num,
        customerName: q.client,
        customerPhone: q.phone,
        subtotal: q.total,
        total: q.total,
        status: q.st,
        items: {
          create: [
            {
              productName: q.item,
              price: q.price,
              quantity: q.qty,
              subtotal: q.total,
            },
          ],
        },
      },
    });
  }

  // 8. Purchases (6 Purchases)
  const purchasesData = [
    { num: "PO/2019/06/0045", sup: "Kurdistan Agro Farm", total: 1200.0, paid: 650.0, due: 550.0, st: PurchaseStatus.RECEIVED },
    { num: "PO/2019/06/0044", sup: "Atlantic Fisheries Ltd", total: 950.0, paid: 0.0, due: 950.0, st: PurchaseStatus.PARTIAL },
    { num: "PO/2019/06/0043", sup: "Organic Dairy Co.", total: 450.0, paid: 450.0, due: 0.0, st: PurchaseStatus.RECEIVED },
    { num: "PO/2019/06/0042", sup: "Premium Beverage Bottling", total: 850.0, paid: 530.0, due: 320.0, st: PurchaseStatus.RECEIVED },
    { num: "PO/2019/06/0041", sup: "Golden Meat Wholesalers", total: 2400.0, paid: 1200.0, due: 1200.0, st: PurchaseStatus.RECEIVED },
  ];

  const firstProdId = Array.from(productRecordMap.values())[0];
  for (const p of purchasesData) {
    await prisma.purchase.upsert({
      where: { purchaseNumber: p.num },
      update: {},
      create: {
        purchaseNumber: p.num,
        supplierName: p.sup,
        totalAmount: p.total,
        paidAmount: p.paid,
        dueAmount: p.due,
        status: p.st,
        items: {
          create: [
            {
              productId: firstProdId,
              productName: "Inventory Restock Shipment",
              costPrice: 8.5,
              quantity: Math.floor(p.total / 10),
              subtotal: p.total,
            },
          ],
        },
      },
    });
  }

  // 9. Stock Transfers (5 Transfers)
  const transfersData = [
    { num: "TRF/2019/06/0008", from: "Store 01", to: "Warehouse B", items: 45, st: TransferStatus.COMPLETED },
    { num: "TRF/2019/06/0007", from: "Central Hub", to: "Store 01", items: 120, st: TransferStatus.COMPLETED },
    { num: "TRF/2019/06/0006", from: "Store 01", to: "Branch Erbil", items: 30, st: TransferStatus.IN_TRANSIT },
    { num: "TRF/2019/06/0005", from: "Store 01", to: "Warehouse A", items: 85, st: TransferStatus.COMPLETED },
    { num: "TRF/2019/06/0004", from: "Warehouse B", to: "Store 01", items: 50, st: TransferStatus.COMPLETED },
  ];

  for (const t of transfersData) {
    await prisma.stockTransfer.upsert({
      where: { transferNumber: t.num },
      update: {},
      create: {
        transferNumber: t.num,
        sourceLocation: t.from,
        destLocation: t.to,
        totalItems: t.items,
        status: t.st,
        items: {
          create: [
            {
              productId: firstProdId,
              productName: "Stock Transfer Unit",
              quantity: t.items,
            },
          ],
        },
      },
    });
  }

  // 10. Expenses (7 Expenses)
  const expensesData = [
    { num: "EXP-001", title: "Monthly Shop Rent (Store 01)", cat: "Rent", amount: 800.0 },
    { num: "EXP-002", title: "Commercial Electricity Bill", cat: "Electricity", amount: 120.0 },
    { num: "EXP-003", title: "Staff Lunch & Tea Supplies", cat: "Supplies", amount: 45.0 },
    { num: "EXP-004", title: "Thermal Receipt Paper Rolls (50 rolls)", cat: "Supplies", amount: 35.0 },
    { num: "EXP-005", title: "Store Air Conditioner Servicing", cat: "Maintenance", amount: 65.0 },
    { num: "EXP-006", title: "Monthly High-Speed Internet Fibernet", cat: "Electricity", amount: 40.0 },
    { num: "EXP-007", title: "Store Floor Cleaning Supplies", cat: "Supplies", amount: 25.0 },
  ];

  for (const e of expensesData) {
    await prisma.expense.upsert({
      where: { expenseNumber: e.num },
      update: {},
      create: {
        expenseNumber: e.num,
        title: e.title,
        category: e.cat,
        amount: e.amount,
        paymentMethod: "CASH",
      },
    });
  }

  // 11. Sales (8 Sales matching AdminLTE images + extra)
  const salesData = [
    { num: "INV/2019/06/00000008", cust: "Bnar Hawleri", amt: 145.0 },
    { num: "INV/2019/06/00000007", cust: "Rebaz Qadir", amt: 85.5 },
    { num: "INV/2019/06/00000006", cust: "Dilan Barzan", amt: 220.0 },
    { num: "INV/2019/06/00000005", cust: "Soran Mohammed", amt: 160.0 },
    { num: "INV/2019/06/00000004", cust: "Tajmul", amt: 200.0 },
    { num: "INV/2019/06/00000003", cust: "Najmul Hossain", amt: 400.0 },
    { num: "INV/2019/06/00000002", cust: "Walking customer", amt: 300.0 },
    { num: "INV/2019/06/00000001", cust: "Today customer", amt: 200.0 },
  ];

  for (const s of salesData) {
    await prisma.sale.upsert({
      where: { invoiceNumber: s.num },
      update: {},
      create: {
        invoiceNumber: s.num,
        cashierId: adminUser.id,
        customerName: s.cust,
        subtotal: s.amt,
        total: s.amt,
        amountReceived: s.amt,
        changeDue: 0,
        paymentMethod: "CASH",
        items: {
          create: [
            {
              productId: firstProdId,
              productName: "Grocery Items Basket",
              price: s.amt,
              cost: s.amt * 0.7,
              quantity: 1,
              subtotal: s.amt,
            },
          ],
        },
      },
    });
  }

  // 12. Cash Register Session
  await prisma.cashRegisterSession.upsert({
    where: { sessionNumber: "SESS-20190615-01" },
    update: {},
    create: {
      sessionNumber: "SESS-20190615-01",
      cashierName: "Admin Manager",
      openingCash: 250.0,
      cashSales: 1710.5,
      cashExpenses: 1130.0,
      expectedCash: 830.5,
      status: "OPEN",
    },
  });

  console.log("🎉 Complete rich retail dataset seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
