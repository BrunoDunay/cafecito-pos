import Product from "../models/Product.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

// Mapear producto a snake_case
const mapProduct = (p) => ({
  product_id: p._id,
  name: p.name,
  price: p.price,
  stock: p.stock,
  image: p.image,
  is_active: p.is_active,  
  category: p.category
    ? {
        category_id: p.category._id,
        name: p.category.name,
      }
    : null,
  created_at: p.createdAt,
  updated_at: p.updatedAt,
});

// Listar productos
export const getProducts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10, category } = req.query;
    const query = {};

    if (q) query.name = { $regex: q, $options: "i" };
    if (category) query.category = category;

    let products;
    let total;

    if (category) {
      products = await Product.find(query).populate("category", "name");
      total = products.length;
    } else {
      const skip = (page - 1) * limit;
      products = await Product.find(query)
        .populate("category", "name")
        .skip(skip)
        .limit(Number(limit));
      total = await Product.countDocuments(query);
    }

    res.json({
      data: products.map(mapProduct),
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

// Crear producto
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, stock, image, category, is_active } = req.body;
    
    if (!name || !price || !category) {
      throw new BadRequestError('Nombre, precio y categoría son obligatorios');
    }

    if (price < 0) {
      throw new BadRequestError('El precio no puede ser negativo');
    }

    if (stock < 0) {
      throw new BadRequestError('El stock no puede ser negativo');
    }

    const product = await Product.create({ 
      name, 
      price, 
      stock, 
      image, 
      category,
      is_active: is_active !== undefined ? is_active : true
    });
    
    const populated = await product.populate("category", "name");
    res.status(201).json(mapProduct(populated));
  } catch (error) {
    next(error);
  }
};

// Actualizar producto
export const updateProduct = async (req, res, next) => {
  try {
    const { price, stock } = req.body;

    if (price !== undefined && price < 0) {
      throw new BadRequestError('El precio no puede ser negativo');
    }

    if (stock !== undefined && stock < 0) {
      throw new BadRequestError('El stock no puede ser negativo');
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("category", "name");

    if (!product) {
      throw new NotFoundError(`Producto con id ${req.params.id} no encontrado`);
    }

    res.json(mapProduct(product));
  } catch (error) {
    next(error);
  }
};

// Obtener producto por ID
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    
    if (!product) {
      throw new NotFoundError(`Producto con id ${req.params.id} no encontrado`);
    }

    res.json(mapProduct(product));
  } catch (error) {
    next(error);
  }
};

// Eliminar producto
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      throw new NotFoundError(`Producto con id ${req.params.id} no encontrado`);
    }

    res.json({ 
      message: "Producto eliminado correctamente", 
      product_id: product._id 
    });
  } catch (error) {
    next(error);
  }
};