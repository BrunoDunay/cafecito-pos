import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

/* Crear nueva venta */
export const createSale = async (req, res) => {
  try {
    const { customerId, paymentMethod = "cash", items } = req.body;

    if (!items || items.length === 0) {
      return res.status(422).json({
        error: "Validation failed",
        details: [{ field: "items", message: "items cannot be empty" }],
      });
    }

    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      if (item.quantity < 1) {
        return res.status(422).json({
          error: "Validation failed",
          details: [
            { field: "quantity", message: "quantity must be >= 1" },
          ],
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({
          error: "Product not found",
          details: [{ productId: item.productId }],
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          error: "Insufficient stock",
          details: [
            {
              productId: product._id,
              message: `Only ${product.stock} available`,
            },
          ],
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

    const saleNumber = `CF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const sale = await Sale.create({
      saleNumber,
      customerId: customer?._id || null,
      paymentMethod,
      items: saleItems,
      subtotal,
      discountPercent,
      discountAmount,
      total,
      soldBy: req.user._id,
    });

    const ticket = {
      sale_id: sale._id,
      timestamp: sale.createdAt,
      store_name: "Cafecito Feliz",
      items: sale.items.map((i) => ({
        name: i.productNameSnapshot,
        qty: i.quantity,
        unit_price: i.unitPriceSnapshot,
        line_total: i.lineTotal,
      })),
      subtotal,
      discount: `${discountPercent}% (-$${discountAmount.toFixed(2)})`,
      total,
      payment_method: paymentMethod,
    };

    res.status(201).json({
      sale_id: sale._id,
      sale_number: sale.saleNumber,
      customer_id: sale.customerId,
      payment_method: paymentMethod,
      items: sale.items.map((i) => ({
        product_id: i.productId,
        product_name: i.productNameSnapshot,
        quantity: i.quantity,
        unit_price: i.unitPriceSnapshot,
        line_total: i.lineTotal,
      })),
      subtotal,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      total,
      ticket,
      created_at: sale.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/* Ver ventas por ID */
export const getSaleById = async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate("customerId", "name phoneOrEmail");

  if (!sale) {
    return res.status(404).json({ error: "Sale not found" });
  }

  res.json(sale);
};

/* Listado de ventas */
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
