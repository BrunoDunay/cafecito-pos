import Customer from "../models/Customer.js";

/* Convierte cliente a snake_case */
const mapCustomer = (c) => ({
  customer_id: c._id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  purchases_count: c.purchases_count,  
  is_active: c.is_active,              
  created_at: c.createdAt,
  updated_at: c.updatedAt,
});

/* Listar clientes con búsqueda */
export const getCustomers = async (req, res) => {
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
};

/* Crear cliente */
export const createCustomer = async (req, res) => {
  const { name, email, phone } = req.body;
  const customer = await Customer.create({ 
    name, 
    email, 
    phone 
  });
  res.status(201).json(mapCustomer(customer));
};

/* Obtener cliente por ID */
export const getCustomerById = async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  res.json(mapCustomer(customer));
};

/* Alternar activo/inactivo */
export const toggleCustomerStatus = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { is_active } = req.body;
    
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    // Actualizar el estado
    customer.is_active = is_active;
    await customer.save();
    
    res.json({
      success: true,
      message: `Cliente ${is_active ? 'activado' : 'desactivado'} correctamente`,
      customer: mapCustomer(customer)
    });
  } catch (error) {
    console.error("Error cambiando estado del cliente:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error interno del servidor" 
    });
  }
};

/* Eliminar cliente */
export const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    // Verificar si tiene compras
    if (customer.purchases_count > 0) {
      return res.status(400).json({ 
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
      message: "Error interno del servidor" 
    });
  }
};