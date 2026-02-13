// controllers/sale.controller.js - VERSIÓN COMPLETA
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

// Mapea venta manteniendo snake_case
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

// Crea nueva venta
export const createSale = async (req, res) => {
  try {
    const { customer_id, items, payment_method, discount_percent = 0, discount_amount = 0 } = req.body;

    console.log('📦 [createSale] Iniciando venta para usuario:', req.user._id);
    console.log('📦 [createSale] Datos recibidos:', {
      customer_id,
      items_count: items?.length,
      payment_method,
      discount_percent,
      discount_amount
    });

    // Validaciones básicas
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        status: "error",
        message: "La venta no contiene productos" 
      });
    }

    if (!payment_method || !['cash', 'card', 'transfer'].includes(payment_method)) {
      return res.status(400).json({ 
        status: "error",
        message: "Método de pago inválido" 
      });
    }

    // Validar stock y calcular totales
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ 
          status: "error",
          message: `Item inválido: ${JSON.stringify(item)}` 
        });
      }

      const product = await Product.findById(item.product_id);

      if (!product) {
        return res.status(404).json({ 
          status: "error",
          message: `Producto no encontrado: ${item.product_id}` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          status: "error",
          message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}` 
        });
      }

      // Calcular precios
      const unit_price_snapshot = product.price;
      const line_total = unit_price_snapshot * item.quantity;
      subtotal += line_total;

      // Agregar item procesado
      processedItems.push({
        product_id: product._id,
        product_name_snapshot: product.name,
        unit_price_snapshot: unit_price_snapshot,
        quantity: item.quantity,
        line_total: line_total
      });

      // Actualizar stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Validar y calcular descuentos
    const finalDiscountPercent = Math.max(0, Math.min(100, discount_percent));
    const finalDiscountAmount = Math.max(0, discount_amount);
    
    const calculatedDiscount = (subtotal * finalDiscountPercent) / 100;
    const totalDiscount = Math.min(subtotal, calculatedDiscount + finalDiscountAmount);
    
    const total = subtotal - totalDiscount;

    console.log('💰 [createSale] Totales calculados:', { 
      subtotal, 
      discount_percent: finalDiscountPercent,
      discount_amount: totalDiscount,
      total 
    });

    // Crear venta
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

    console.log('✅ [createSale] Venta creada exitosamente con ID:', sale._id);

    // 🟢 **INCREMENTAR CONTADOR DE COMPRAS DEL CLIENTE - PARTE CRÍTICA**
    if (customer_id) {
      try {
        console.log('🔄 [createSale] Incrementando contador de compras para cliente:', customer_id);
        
        // Verificar si el cliente existe antes de actualizar
        const existingCustomer = await Customer.findById(customer_id);
        
        if (!existingCustomer) {
          console.log('⚠️ [createSale] Cliente no encontrado, no se incrementa contador:', customer_id);
        } else {
          console.log('📊 [createSale] Compras actuales del cliente:', {
            cliente: customer_id,
            nombre: existingCustomer.name,
            compras_actuales: existingCustomer.purchases_count
          });
          
          // Incrementar purchases_count en 1
          const updatedCustomer = await Customer.findByIdAndUpdate(
            customer_id, 
            { 
              $inc: { purchases_count: 1 } 
            },
            { new: true } // Retorna el documento actualizado
          );
          
          console.log('📈 [createSale] Contador actualizado:', {
            cliente: customer_id,
            nombre: updatedCustomer.name,
            nuevas_compras: updatedCustomer.purchases_count,
            incremento: 1
          });
        }
      } catch (customerError) {
        console.error('❌ [createSale] Error actualizando contador del cliente:', customerError.message);
        console.error('❌ [createSale] Stack trace:', customerError.stack);
        // No detenemos la venta por un error en el contador
      }
    } else {
      console.log('ℹ️ [createSale] Venta sin cliente (general), no se incrementa contador');
    }

    // Obtener venta con datos poblados
    const populatedSale = await Sale.findById(sale._id)
      .populate({
        path: "customer_id",
        select: "name email purchases_count is_active"
      })
      .populate("sold_by", "name email");

    console.log('📄 [createSale] Venta poblada obtenida');

    res.status(201).json(mapSale(populatedSale));

  } catch (error) {
    console.error('❌ [createSale] Error general:', error.message);
    console.error('❌ [createSale] Stack trace:', error.stack);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        status: "error",
        message: "Error de validación en los datos de la venta",
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      status: "error",
      message: "Error interno del servidor al crear la venta",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lista todas las ventas
export const getSales = async (req, res) => {
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
      sales: sales.map(mapSale),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ [getSales] Error:', error);
    res.status(500).json({ 
      status: "error",
      message: "Error al obtener las ventas"
    });
  }
};

// Obtiene venta por ID
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate({
        path: "customer_id",
        select: "name email purchases_count"
      })
      .populate("sold_by", "name email");

    if (!sale) {
      return res.status(404).json({ 
        status: "error",
        message: "Venta no encontrada" 
      });
    }

    res.json(mapSale(sale));
  } catch (error) {
    console.error('❌ [getSaleById] Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        status: "error",
        message: "ID de venta inválido" 
      });
    }
    
    res.status(500).json({ 
      status: "error",
      message: "Error al obtener la venta" 
    });
  }
};