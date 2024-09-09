require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_BACKEND_KEY); // Corrected key name
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const app = express();
app.use(express.json());

// Configure allowed origins for CORS
const allowedOrigins = [
  "https://shopper-frontend-chi.vercel.app",
  "https://shopper-admin-psi.vercel.app",
  "http://localhost:5174",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Serve static files from 'public' directory
app.use("/Images", express.static(path.join(__dirname, "Upload/Images")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Default route
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// Configure Cloudinary
cloudinary.config({
  url: process.env.CLOUDINARY_URL,
});

// Use multer to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Image upload endpoint
app.post("/Upload", upload.single("Product-vercel"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const stream = streamifier.createReadStream(req.file.buffer);

  cloudinary.uploader
    .upload_stream({ resource_type: "auto" }, (error, result) => {
      if (error) {
        return res.status(500).json({ error: "Error uploading file" });
      }
      res.json({
        success: true,
        image_url: result.secure_url, // Cloudinary URL
      });
    })
    .end(req.file.buffer);
});

// Define the Product model
const Product = mongoose.model("Product-vercel", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
  popular: {
    type: Boolean,
    default: false,
  },
});

// Endpoint to add a product
app.post("/addproduct", async (req, res) => {
  try {
    let products = await Product.find({});
    let id = products.length > 0 ? products[products.length - 1].id + 1 : 40;

    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await product.save();
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
});

// Endpoint to remove a product
app.post("/removeproduct", async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to remove product" });
  }
});

// Endpoint to get all products
app.get("/allproduct", async (req, res) => {
  try {
    let products = await Product.find({});
    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
});

// Endpoint to create a checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Amount in cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "https://localhost:5173/success",
      cancel_url: "https://localhost:5173/cancel",
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to get a single product by ID
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: parseInt(req.params.id, 10) });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Failed to fetch product details" });
  }
});

// Endpoint to fetch new collections
app.get("/newcollections", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ date: -1 }).limit(8); // Fetch the 8 latest products
    console.log("New Collections Fetched");
    res.json(products);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({ message: "Failed to fetch new collections" });
  }
});

// Endpoint to fetch popular products
app.get("/popular-products", async (req, res) => {
  try {
    const popularProducts = await Product.find({ popular: true });
    res.json(popularProducts);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching popular products" });
  }
});

// Endpoint to toggle popular status
app.post("/togglePopular", async (req, res) => {
  const { id, isPopular } = req.body;
  try {
    const product = await Product.findOneAndUpdate(
      { id: id },
      { $set: { popular: isPopular } },
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(500).send("Error updating product status");
  }
});

// Route to update all products with the 'popular' field
app.post("/update-all-products", async (req, res) => {
  try {
    const result = await Product.updateMany({}, { $set: { popular: false } });
    res.json({
      success: true,
      message: `Updated ${result.nModified} products`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating products" });
  }
});

// Endpoint to update a product
app.post("/updateproduct", async (req, res) => {
  const { id, name, old_price, new_price, category } = req.body;

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { id },
      { name, old_price, new_price, category },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product details" });
  }
});

// Start the server
const port = process.env.PORT || 4000; // Fallback port if not set in .env
app.listen(port, (error) => {
  if (!error) {
    console.log("Server running on port: " + port);
  } else {
    console.log("Error: " + error);
  }
});
