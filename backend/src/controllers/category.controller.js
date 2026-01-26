import Category from "../models/Category.js";
import Product from "../models/Product.js";

/* Listar categorías */
export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};

/* Crear categoría */
export const createCategory = async (req, res) => {
  const category = await Category.create({ name: req.body.name });
  res.status(201).json(category);
};

/* Eliminar categoría SOLO si no tiene productos */
export const deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  const productsCount = await Product.countDocuments({
    category: categoryId
  });

  if (productsCount > 0) {
    return res.status(400).json({
      message: "No se puede eliminar la categoría porque tiene productos asignados",
      productsCount
    });
  }

  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  res.json({ message: "Category deleted" });
};
