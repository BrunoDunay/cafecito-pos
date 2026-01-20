import Customer from "../models/Customer.js";
import Sale from "../models/Sale.js";

/* Listar clientes con búsqueda y paginación */
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

  res.json({ data: customers, total, page, limit });
};


/* Crear nuevo cliente */
export const createCustomer = async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json(customer);
};

/* Ver cliente por ID */
export const getCustomerById = async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  res.json(customer);
};

/** Borrar cliente */
export const deleteCustomer = async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  res.json({ message: "Customer deleted" });
};
