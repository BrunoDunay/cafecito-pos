import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

const mapSale = (sale) => {
  return {
    sale_id: sale._id,
    customer_id: sale.customer_id?._id || sale.customer_id,
    customer_name: sale.customer_id?.name || null,
    customer_email: sale.customer_id?.email || null,
    customer_purchases_count: sale.customer_id?.purchases_count || 0,
    sold_by: sale.sold_by?._id || sale.sold_by,
    sold_by_name: sale.sold_by?.name || null,
    items: sale.items.map(item => ({
      product_id: item.product_id?._id || item.product_id,
      product_name_snapshot: item.product_name_snapshot,
      unit_price_snapshot: item.unit_price_snapshot,
      quantity: item.quantity,
      line_total: item.line_total,
    })),
    payment_method: sale.payment_method,
    subtotal: sale.subtotal,
    discount_percent: sale.discount_percent,
    discount_amount: sale.discount_amount,
    total: sale.total,
    created_at: sale.createdAt,
    updated_at: sale.updatedAt,
  };
};

export const createSale = async (req, res, next) => {
  try {
    const { customer_id, items, payment_method, discount_percent = 0, discount_amount = 0 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError("La venta no contiene productos");
    }

    if (!payment_method || !['cash', 'card', 'transfer'].includes(payment_method)) {
      throw new BadRequestError("Método de pago inválido");
    }

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        throw new BadRequestError(`Item inválido: ${JSON.stringify(item)}`);
      }

      const product = await Product.findById(item.product_id);

      if (!product) {
        throw new NotFoundError(`Producto no encontrado: ${item.product_id}`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestError(
          `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`
        );
      }

      const unit_price_snapshot = product.price;
      const line_total = unit_price_snapshot * item.quantity;
      subtotal += line_total;

      processedItems.push({
        product_id: product._id,
        product_name_snapshot: product.name,
        unit_price_snapshot: unit_price_snapshot,
        quantity: item.quantity,
        line_total: line_total
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const finalDiscountPercent = Math.max(0, Math.min(100, discount_percent));
    const finalDiscountAmount = Math.max(0, discount_amount);
    
    const calculatedDiscount = (subtotal * finalDiscountPercent) / 100;
    const totalDiscount = Math.min(subtotal, calculatedDiscount + finalDiscountAmount);
    const total = subtotal - totalDiscount;

    const sale = await Sale.create({
      customer_id: customer_id || null,
      sold_by: req.user._id,
      items: processedItems,
      payment_method: payment_method,
      subtotal: subtotal,
      discount_percent: finalDiscountPercent,
      discount_amount: totalDiscount,
      total: total,
    });

    if (customer_id) {
      try {
        await Customer.findByIdAndUpdate(
          customer_id, 
          { $inc: { purchases_count: 1 } }
        );
      } catch (customerError) {
        console.error('Error actualizando contador del cliente:', customerError);
      }
    }

    const populatedSale = await Sale.findById(sale._id)
      .populate({
        path: "customer_id",
        select: "name email purchases_count is_active"
      })
      .populate("sold_by", "name email");

    res.status(201).json(mapSale(populatedSale));

  } catch (error) {
    next(error);
  }
};

export const getSales = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const sales = await Sale.find()
      .populate({
        path: "customer_id",
        select: "name email purchases_count"
      })
      .populate("sold_by", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Sale.countDocuments();

    res.json({
      data: sales.map(mapSale),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate({
        path: "customer_id",
        select: "name email purchases_count"
      })
      .populate("sold_by", "name email");

    if (!sale) {
      throw new NotFoundError("Venta no encontrada");
    }

    res.json(mapSale(sale));
  } catch (error) {
    if (error.name === 'CastError') {
      next(new BadRequestError("ID de venta inválido"));
    } else {
      next(error);
    }
  }
};