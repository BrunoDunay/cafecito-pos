import Category from "../models/Category.js";

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

/* Eliminar categoría */
export const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  res.json({ message: "Category deleted" });
};
