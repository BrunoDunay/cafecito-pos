import Product from "../models/Product.js";

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

export const getProducts = async (req, res) => {
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
};

export const createProduct = async (req, res) => {
  const { name, price, stock, image, category, is_active } = req.body;
  const product = await Product.create({ 
    name, 
    price, 
    stock, 
    image, 
    category,
    is_active 
  });
  const populated = await product.populate("category", "name");
  res.status(201).json(mapProduct(populated));
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).populate("category", "name");

  res.json(mapProduct(product));
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name");
  res.json(mapProduct(product));
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted", product_id: product._id });
};