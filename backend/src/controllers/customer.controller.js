import Customer from "../models/Customer.js";

/* Convierte cliente a snake_case - VERSIÓN MEJORADA */
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

/* Listar clientes con búsqueda - YA ESTÁ BIEN */
export const getCustomers = async (req, res) => {
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
      success: true,
      data: customers.map(mapCustomer),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Error getting customers:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor" 
    });
  }
};

/* Crear cliente - VERSIÓN MEJORADA */
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Validaciones básicas
    if (!name || !email) {
      return res.status(400).json({ 
        success: false,
        message: "Nombre y email son requeridos" 
      });
    }
    
    // Verificar si el email ya existe
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existingCustomer) {
      return res.status(409).json({ 
        success: false,
        message: "El email ya está registrado" 
      });
    }
    
    // Crear cliente con valores por defecto
    const customer = await Customer.create({ 
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      purchases_count: 0,  // Inicializar en 0
      is_active: true      // Inicializar como activo
    });
    
    res.status(201).json(mapCustomer(customer));
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor al crear cliente" 
    });
  }
};

/* Obtener cliente por ID - VERSIÓN MEJORADA */
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ 
        success: false,
        message: "Cliente no encontrado" 
      });
    }
    
    res.json({
      success: true,
      data: mapCustomer(customer)
    });
  } catch (error) {
    console.error("Error getting customer:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: "ID de cliente inválido" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor" 
    });
  }
};

/* Alternar activo/inactivo - YA ESTÁ BIEN (pero agregar default) */
export const toggleCustomerStatus = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { is_active } = req.body;
    
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ 
        success: false,
        message: "Cliente no encontrado" 
      });
    }
    
    // Actualizar el estado (usar true por defecto si no se especifica)
    customer.is_active = is_active !== undefined ? is_active : !customer.is_active;
    await customer.save();
    
    res.json({
      success: true,
      message: `Cliente ${customer.is_active ? 'activado' : 'desactivado'} correctamente`,
      data: mapCustomer(customer)
    });
  } catch (error) {
    console.error("Error cambiando estado del cliente:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error interno del servidor" 
    });
  }
};

/* Eliminar cliente - YA ESTÁ BIEN */
export const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ 
        success: false,
        message: "Cliente no encontrado" 
      });
    }
    
    // Verificar si tiene compras
    if (customer.purchases_count > 0) {
      return res.status(400).json({ 
        success: false,
        message: "No se puede eliminar un cliente con compras registradas" 
      });
    }
    
    // Eliminar el cliente
    await Customer.findByIdAndDelete(customerId);
    
    res.json({ 
      success: true, 
      message: "Cliente eliminado correctamente" 
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor" 
    });
  }
};