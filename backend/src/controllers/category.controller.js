import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

const mapCategory = (c) => ({
  category_id: c._id,
  name: c.name,
  description: c.description,
  image: c.image,
  is_active: c.is_active, 
  created_at: c.createdAt,
  updated_at: c.updatedAt,
});

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories.map(mapCategory));
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    
    if (!name) {
      throw new BadRequestError('El nombre de la categoría es obligatorio');
    }
    
    const category = await Category.create({ 
      name, 
      description, 
      image 
    });
    res.status(201).json(mapCategory(category));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      throw new NotFoundError(`Categoría con id ${req.params.id} no encontrada`);
    }
    
    const productsCount = await Product.countDocuments({
      category: req.params.id,
    });

    if (productsCount > 0) {
      throw new BadRequestError(
        `No se puede eliminar: la categoría tiene ${productsCount} producto(s) asociado(s)`
      );
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ 
      message: "Categoría eliminada correctamente",
      category_id: req.params.id 
    });
  } catch (error) {
    next(error);
  }
};