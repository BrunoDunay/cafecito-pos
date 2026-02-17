import Customer from "../models/Customer.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

const mapCustomer = (c) => ({
  customer_id: c._id,
  name: c.name,
  email: c.email,
  phone: c.phone || null,
  purchases_count: c.purchases_count || 0,  
  is_active: c.is_active !== undefined ? c.is_active : true,              
  created_at: c.createdAt,
  updated_at: c.updatedAt,
});

export const getCustomers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    const query = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { phone: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(query).skip(skip).limit(Number(limit)),
      Customer.countDocuments(query),
    ]);

    res.json({
      data: customers.map(mapCustomer),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    
    if (!name || !email) {
      throw new BadRequestError("Nombre y email son requeridos");
    }
    
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existingCustomer) {
      throw new BadRequestError("El email ya está registrado");
    }
    
    const customer = await Customer.create({ 
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      purchases_count: 0,
      is_active: true
    });
    
    res.status(201).json(mapCustomer(customer));
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      throw new NotFoundError("Cliente no encontrado");
    }
    
    res.json({
      data: mapCustomer(customer)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      next(new BadRequestError("ID de cliente inválido"));
    } else {
      next(error);
    }
  }
};

export const toggleCustomerStatus = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const { is_active } = req.body;
    
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      throw new NotFoundError("Cliente no encontrado");
    }
    
    customer.is_active = is_active !== undefined ? is_active : !customer.is_active;
    await customer.save();
    
    res.json({
      message: `Cliente ${customer.is_active ? 'activado' : 'desactivado'} correctamente`,
      data: mapCustomer(customer)
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      throw new NotFoundError("Cliente no encontrado");
    }
    
    if (customer.purchases_count > 0) {
      throw new BadRequestError("No se puede eliminar un cliente con compras registradas");
    }
    
    await Customer.findByIdAndDelete(customerId);
    
    res.json({ 
      message: "Cliente eliminado correctamente" 
    });
  } catch (error) {
    next(error);
  }
};