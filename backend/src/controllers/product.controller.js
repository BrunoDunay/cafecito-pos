import Product from "../models/Product.js";

/* Listar productos con búsqueda y paginación */
export const getProducts = async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 10,
      category
    } = req.query;

    const query = {};

    // búsqueda por nombre
    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    // filtro por categoría
    if (category) {
      query.category = category;
    }

    let products;
    let total;

    if (category) {
      // Si hay categoría no pagina
      products = await Product.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1, _id: 1 });

      total = products.length;
    } else {
      // Si no hay categoría pagina
      const skip = (page - 1) * limit;

      products = await Product.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1, _id: 1 })
        .skip(skip)
        .limit(Number(limit));

      total = await Product.countDocuments(query);
    }

    res.json({
      data: products,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching products" });
  }
};

/* Crear producto */
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;

    const product = await Product.create({
      name,
      price,
      stock,
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(422).json({ error: "Validation failed", details: error.message });
  }
};

/* Actualizar producto */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(422).json({ error: "Update failed" });
  }
};

/* Obtener producto por ID */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "Invalid product ID" });
  }
};

/** Eliminar producto */
export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({ message: "Product deleted", id: product._id });
};
