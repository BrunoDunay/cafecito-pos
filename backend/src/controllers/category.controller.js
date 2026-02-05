import Category from "../models/Category.js";
import Product from "../models/Product.js";

/* Convierte categoría a snake_case */
const mapCategory = (c) => ({
  category_id: c._id,
  name: c.name,
  description: c.description,
  image: c.image,
  is_active: c.is_active, 
  created_at: c.createdAt,
  updated_at: c.updatedAt,
});

/* Listar categorías */
export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories.map(mapCategory));
};

/* Crear categoría */
export const createCategory = async (req, res) => {
  const { name, description, image } = req.body;
  const category = await Category.create({ 
    name, 
    description, 
    image 
  });
  res.status(201).json(mapCategory(category));
};

/* Eliminar categoría si no tiene productos */
export const deleteCategory = async (req, res) => {
  const productsCount = await Product.countDocuments({
    category: req.params.id,
  });

  if (productsCount > 0)
    return res.status(400).json({
      message: "Category has products",
      products_count: productsCount,
    });

  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
};