import { PrismaClient, Role, PrinterType, QuotationStatus, PurchaseStatus, TransferStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seed...");

  // 1. Create Default Settings
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
      taxRate: 5.0, // 5% VAT
      currency: "USD",
    },
  });
  console.log("✓ Settings initialized");

  // 2. Create Users (Admin & Cashier)
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
  console.log("✓ Users seeded: admin / admin123, cashier / cashier123");

  // 3. Create Categories
  const categoriesData = [
    { name: "Fruits", nameKu: "میوە", slug: "fruits", icon: "Apple" },
    { name: "Vegetables", nameKu: "سەوزەوات", slug: "vegetables", icon: "Carrot" },
    { name: "Meat", nameKu: "گۆشت", slug: "meat", icon: "Beef" },
    { name: "Fish", nameKu: "ماسی", slug: "fish", icon: "Fish" },
    { name: "Bakery & Dairy", nameKu: "نان و شیرەمەنی", slug: "bakery-dairy", icon: "Croissant" },
    { name: "Drinks", nameKu: "خواردنەوەکان", slug: "drinks", icon: "Coffee" },
    { name: "Snacks", nameKu: "سووکە ژەم", slug: "snacks", icon: "Cookie" },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log("✓ Categories seeded:", categoriesData.length);

  // 4. Create Sample Products
  const productsData = [
    {
      name: "Fresh Red Apple",
      nameKu: "سێوی سووری فرێش",
      barcode: "1001001",
      price: 12.0,
      cost: 8.5,
      stock: 45,
      minStockAlert: 10,
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80",
      categorySlug: "fruits",
    },
    {
      name: "Fresh Orange",
      nameKu: "پڕتەقاڵی فرێش",
      barcode: "1001002",
      price: 10.5,
      cost: 7.0,
      stock: 35,
      minStockAlert: 10,
      image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400&auto=format&fit=crop&q=80",
      categorySlug: "fruits",
    },
    {
      name: "Fresh Green Broccoli",
      nameKu: "برۆکلی کەسک",
      barcode: "1001003",
      price: 8.0,
      cost: 5.0,
      stock: 25,
      minStockAlert: 5,
      image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&auto=format&fit=crop&q=80",
      categorySlug: "vegetables",
    },
    {
      name: "Fresh Tomatoes 2Kg",
      nameKu: "تەماتەی فرێش ٢ کیلۆ",
      barcode: "1001004",
      price: 15.0,
      cost: 10.0,
      stock: 40,
      minStockAlert: 8,
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80",
      categorySlug: "vegetables",
    },
    {
      name: "Sweet Strawberries 500g",
      nameKu: "فراولەی شیرین ٥٠٠ گرام",
      barcode: "1001005",
      price: 14.0,
      cost: 9.0,
      stock: 20,
      minStockAlert: 5,
      image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop&q=80",
      categorySlug: "fruits",
    },
    {
      name: "Organic Whole Milk 1L",
      nameKu: "شیری سروشتی ١ لیتر",
      barcode: "1001006",
      price: 4.5,
      cost: 3.0,
      stock: 60,
      minStockAlert: 15,
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80",
      categorySlug: "bakery-dairy",
    },
    {
      name: "Farm Fresh Eggs 12pcs",
      nameKu: "هێلکەی کێڵگە ١٢ دانە",
      barcode: "1001007",
      price: 6.0,
      cost: 4.2,
      stock: 35,
      minStockAlert: 10,
      image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80",
      categorySlug: "bakery-dairy",
    },
    {
      name: "Whole Grain Sourdough Bread",
      nameKu: "نانی دانەوێڵەی تەندروست",
      barcode: "1001008",
      price: 3.5,
      cost: 2.1,
      stock: 18,
      minStockAlert: 5,
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
      categorySlug: "bakery-dairy",
    },
    {
      name: "Premium Beef Ribeye Steak 1Kg",
      nameKu: "گۆشتی نەرمی مانگا ١ کیلۆ",
      barcode: "1001009",
      price: 28.0,
      cost: 21.0,
      stock: 15,
      minStockAlert: 4,
      image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&auto=format&fit=crop&q=80",
      categorySlug: "meat",
    },
    {
      name: "Fresh Atlantic Salmon 500g",
      nameKu: "ماسی سەلەمۆنی فرێش ٥٠٠ گرام",
      barcode: "1001010",
      price: 22.0,
      cost: 16.5,
      stock: 12,
      minStockAlert: 3,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80",
      categorySlug: "fish",
    },
    {
      name: "Pure Natural Mineral Water 500ml",
      nameKu: "ئاوی سروشتی کانزایی ٥٠٠ مل",
      barcode: "1001011",
      price: 1.0,
      cost: 0.4,
      stock: 150,
      minStockAlert: 20,
      image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80",
      categorySlug: "drinks",
    },
    {
      name: "Fresh Squeezed Orange Juice 1L",
      nameKu: "شەربەتی سروشتی پڕتەقاڵ ١ لیتر",
      barcode: "1001012",
      price: 5.0,
      cost: 3.2,
      stock: 30,
      minStockAlert: 8,
      image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&auto=format&fit=crop&q=80",
      categorySlug: "drinks",
    },
  ];

  const productRecordMap = new Map<string, string>();
  for (const item of productsData) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) continue;

    const prod = await prisma.product.upsert({
      where: { barcode: item.barcode },
      update: {},
      create: {
        name: item.name,
        nameKu: item.nameKu,
        barcode: item.barcode,
        price: item.price,
        cost: item.cost,
        stock: item.stock,
        minStockAlert: item.minStockAlert,
        image: item.image,
        categoryId: categoryId,
      },
    });
    productRecordMap.set(item.barcode, prod.id);
  }
  console.log("✓ Products seeded:", productsData.length);

  // 5. Seed Customers
  const customersData = [
    { code: "CUST-001", name: "Tajmul", nameKu: "تاجمل", phone: "+964 750 111 2233", totalSpent: 1850.0, dueBalance: 0.0 },
    { code: "CUST-002", name: "Najmul Hossain", nameKu: "نەجمل حوسێن", phone: "+964 750 222 3344", totalSpent: 1240.0, dueBalance: 400.0 },
    { code: "CUST-003", name: "Karwan Ahmed", nameKu: "کاروان ئەحمەد", phone: "+964 750 333 4455", totalSpent: 750.0, dueBalance: 150.0 },
    { code: "CUST-004", name: "Soran Mohammed", nameKu: "سۆران محەمەد", phone: "+964 750 444 5566", totalSpent: 2300.0, dueBalance: 0.0 },
    { code: "CUST-005", name: "Walk-in Customer", nameKu: "موشتەری ڕێبوار", phone: "-", totalSpent: 4500.0, dueBalance: 0.0 },
  ];

  for (const c of customersData) {
    await prisma.customer.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  console.log("✓ Customers seeded:", customersData.length);

  // 6. Seed Suppliers
  const suppliersData = [
    { code: "SUP-001", name: "Kurdistan Agro Farm", company: "Kurdistan Agro LLC", phone: "+964 750 999 1111", balanceDue: 550.0 },
    { code: "SUP-002", name: "Atlantic Fisheries Ltd", company: "Atlantic Marine Imports", phone: "+964 750 888 2222", balanceDue: 950.0 },
    { code: "SUP-003", name: "Organic Dairy Co.", company: "Organic Dairy Farm", phone: "+964 750 777 3333", balanceDue: 0.0 },
    { code: "SUP-004", name: "Premium Beverage Bottling", company: "Beverage Bottling Corp", phone: "+964 750 666 4444", balanceDue: 320.0 },
  ];

  const supplierMap = new Map<string, string>();
  for (const s of suppliersData) {
    const created = await prisma.supplier.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
    supplierMap.set(s.code, created.id);
  }
  console.log("✓ Suppliers seeded:", suppliersData.length);

  // 7. Seed Quotations
  await prisma.quotation.upsert({
    where: { quoteNumber: "QTN/2019/06/0012" },
    update: {},
    create: {
      quoteNumber: "QTN/2019/06/0012",
      customerName: "Grand Hypermarket",
      customerPhone: "+964 750 555 1234",
      subtotal: 1450.0,
      total: 1450.0,
      status: QuotationStatus.PENDING,
      items: {
        create: [
          { productName: "Fresh Red Apple", price: 12.0, quantity: 50, subtotal: 600.0 },
          { productName: "Fresh Tomatoes 2Kg", price: 15.0, quantity: 50, subtotal: 750.0 },
          { productName: "Organic Whole Milk 1L", price: 4.5, quantity: 22, subtotal: 100.0 },
        ],
      },
    },
  });

  await prisma.quotation.upsert({
    where: { quoteNumber: "QTN/2019/06/0011" },
    update: {},
    create: {
      quoteNumber: "QTN/2019/06/0011",
      customerName: "Erbil Fresh Market",
      customerPhone: "+964 750 666 2345",
      subtotal: 850.0,
      total: 850.0,
      status: QuotationStatus.ACCEPTED,
      items: {
        create: [
          { productName: "Premium Beef Ribeye Steak 1Kg", price: 28.0, quantity: 25, subtotal: 700.0 },
          { productName: "Sweet Strawberries 500g", price: 15.0, quantity: 10, subtotal: 150.0 },
        ],
      },
    },
  });
  console.log("✓ Quotations seeded");

  // 8. Seed Purchases
  const agroSupplierId = supplierMap.get("SUP-001");
  const appleId = productRecordMap.get("1001001");

  if (appleId) {
    await prisma.purchase.upsert({
      where: { purchaseNumber: "PO/2019/06/0045" },
      update: {},
      create: {
        purchaseNumber: "PO/2019/06/0045",
        supplierId: agroSupplierId,
        supplierName: "Kurdistan Agro Farm",
        totalAmount: 1200.0,
        paidAmount: 650.0,
        dueAmount: 550.0,
        status: PurchaseStatus.RECEIVED,
        items: {
          create: [
            {
              productId: appleId,
              productName: "Fresh Red Apple",
              costPrice: 8.5,
              quantity: 100,
              subtotal: 850.0,
            },
          ],
        },
      },
    });
  }
  console.log("✓ Purchases seeded");

  // 9. Seed Stock Transfers
  if (appleId) {
    await prisma.stockTransfer.upsert({
      where: { transferNumber: "TRF/2019/06/0008" },
      update: {},
      create: {
        transferNumber: "TRF/2019/06/0008",
        sourceLocation: "Store 01",
        destLocation: "Warehouse B",
        status: TransferStatus.COMPLETED,
        totalItems: 45,
        items: {
          create: [
            {
              productId: appleId,
              productName: "Fresh Red Apple",
              quantity: 45,
            },
          ],
        },
      },
    });
  }
  console.log("✓ Stock Transfers seeded");

  // 10. Seed Expenses
  const expensesData = [
    { expenseNumber: "EXP-001", title: "Monthly Shop Rent (Store 01)", category: "Rent", amount: 800.0 },
    { expenseNumber: "EXP-002", title: "Commercial Electricity Bill", category: "Electricity", amount: 120.0 },
    { expenseNumber: "EXP-003", title: "Staff Lunch & Tea Supplies", category: "Supplies", amount: 45.0 },
    { expenseNumber: "EXP-004", title: "Thermal Receipt Paper Rolls (50 rolls)", category: "Supplies", amount: 35.0 },
  ];

  for (const exp of expensesData) {
    await prisma.expense.upsert({
      where: { expenseNumber: exp.expenseNumber },
      update: {},
      create: exp,
    });
  }
  console.log("✓ Expenses seeded");

  // 11. Seed Cash Register Session
  await prisma.cashRegisterSession.upsert({
    where: { sessionNumber: "SESS-20190615-01" },
    update: {},
    create: {
      sessionNumber: "SESS-20190615-01",
      cashierName: "Admin Manager",
      openingCash: 250.0,
      cashSales: 1100.0,
      cashExpenses: 45.0,
      expectedCash: 1305.0,
      status: "OPEN",
    },
  });
  console.log("✓ Cash Register Session seeded");

  // 12. Seed Sample Sales (to match AdminLTE image rows!)
  if (appleId) {
    const saleRows = [
      { invoice: "INV/2019/06/00000004", customer: "Tajmul", amount: 200.0, received: 200.0, change: 0.0 },
      { invoice: "INV/2019/06/00000003", customer: "Najmul Hossain", amount: 400.0, received: 400.0, change: 0.0 },
      { invoice: "INV/2019/06/00000002", customer: "Walking customer", amount: 300.0, received: 300.0, change: 0.0 },
      { invoice: "INV/2019/06/00000001", customer: "Today customer", amount: 200.0, received: 200.0, change: 0.0 },
    ];

    for (const s of saleRows) {
      await prisma.sale.upsert({
        where: { invoiceNumber: s.invoice },
        update: {},
        create: {
          invoiceNumber: s.invoice,
          cashierId: adminUser.id,
          customerName: s.customer,
          subtotal: s.amount,
          total: s.amount,
          amountReceived: s.received,
          changeDue: s.change,
          items: {
            create: [
              {
                productId: appleId,
                productName: "Fresh Red Apple",
                price: 12.0,
                cost: 8.5,
                quantity: Math.floor(s.amount / 12),
                subtotal: s.amount,
              },
            ],
          },
        },
      });
    }
    console.log("✓ Sample Sales matching AdminLTE seeded");
  }

  console.log("🎉 All seeds finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
