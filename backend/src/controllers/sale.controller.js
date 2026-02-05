import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

// Mapea venta a snake_case para respuesta API
const mapSale = (s) => ({
  sale_id: s._id,
  sale_number: s.sale_number,
  customer_id: s.customer_id,
  sold_by: s.sold_by,
  items: s.items.map(i => ({
    product_id: i.product_id,
    product_name_snapshot: i.product_name_snapshot,
    unit_price_snapshot: i.unit_price_snapshot,
    quantity: i.quantity,
    line_total: i.line_total,
  })),
  payment_method: s.payment_method,
  subtotal: s.subtotal,
  discount_percent: s.discount_percent,
  discount_amount: s.discount_amount,
  total: s.total,
  created_at: s.createdAt,
  updated_at: s.updatedAt,
});

// Crea nueva venta
export const createSale = async (req, res) => {
  const { customer_id, items, payment_method } = req.body;

  // Validar stock y calcular totales
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product_id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.stock < item.quantity)
      return res.status(400).json({ message: "Insufficient stock" });

    item.unit_price_snapshot = product.price;
    item.line_total = product.price * item.quantity;
    subtotal += item.line_total;

    product.stock -= item.quantity;
    await product.save();
  }

  // Aplicar descuento si existe
  const discount_percent = req.body.discount_percent || 0;
  const discount_amount = (subtotal * discount_percent) / 100;
  const total = subtotal - discount_amount;

  // Crear venta
  const sale = await Sale.create({
    sale_number: `SALE-${Date.now()}`,
    customer_id: customer_id,
    sold_by: req.user.userId,
    items: items.map(async i => ({
      product_id: i.product_id,
      product_name_snapshot: i.product_name_snapshot || await Product.findById(i.product_id).then(p => p.name),
      unit_price_snapshot: i.unit_price_snapshot,
      quantity: i.quantity,
      line_total: i.line_total,
    })),
    payment_method: payment_method,
    subtotal: subtotal,
    discount_percent: discount_percent,
    discount_amount: discount_amount,
    total: total,
  });

  // Incrementar contador de compras del cliente
  if (customer_id) {
    await Customer.findByIdAndUpdate(customer_id, {
      $inc: { purchases_count: 1 },
    });
  }

  res.status(201).json(mapSale(sale));
};

// Lista todas las ventas
export const getSales = async (req, res) => {
  const sales = await Sale.find()
    .populate("customer_id", "name")
    .populate("sold_by", "name")
    .sort({ createdAt: -1 });

  res.json(sales.map(mapSale));
};

// Obtiene venta por ID
export const getSaleById = async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate("customer_id", "name")
    .populate("sold_by", "name");

  if (!sale)
    return res.status(404).json({ message: "Sale not found" });

  res.json(mapSale(sale));
};