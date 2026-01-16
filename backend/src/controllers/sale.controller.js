import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

/**
 * POST /api/sales
 */
export const createSale = async (req, res) => {
  const { customerId, paymentMethod = "cash", items } = req.body;

  if (!items || items.length === 0) {
    return res.status(422).json({ error: "Items cannot be empty" });
  }

  let subtotal = 0;
  const saleItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    if (item.quantity > product.stock) {
      return res.status(400).json({
        error: "Insufficient stock",
        productId: product._id,
      });
    }

    const lineTotal = product.price * item.quantity;

    saleItems.push({
      productId: product._id,
      productNameSnapshot: product.name,
      unitPriceSnapshot: product.price,
      quantity: item.quantity,
      lineTotal,
    });

    subtotal += lineTotal;
    product.stock -= item.quantity;
    await product.save();
  }

  let discountPercent = 0;
  let customer = null;

  if (customerId) {
    customer = await Customer.findById(customerId);

    if (customer) {
      if (customer.purchasesCount >= 8) discountPercent = 15;
      else if (customer.purchasesCount >= 4) discountPercent = 10;
      else if (customer.purchasesCount >= 1) discountPercent = 5;

      customer.purchasesCount += 1;
      await customer.save();
    }
  }

  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

  const sale = await Sale.create({
    customerId: customer?._id || null,
    paymentMethod,
    items: saleItems,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    soldBy: req.user?._id,
  });

  res.status(201).json(sale);
};

/**
 * GET /api/sales/:id
 */
export const getSaleById = async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate("customerId", "name phoneOrEmail");

  if (!sale) {
    return res.status(404).json({ error: "Sale not found" });
  }

  res.json(sale);
};

/**
 * GET /api/sales
 * Listado de ventas (filtrable por día)
 */
export const getSales = async (req, res) => {
  const { date } = req.query;

  const query = {};

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    query.createdAt = { $gte: start, $lte: end };
  }

  const sales = await Sale.find(query)
    .sort({ createdAt: -1 })
    .populate("customerId", "name");

  res.json(sales);
};
