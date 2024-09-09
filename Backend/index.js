require("dotenv").config();
const port = process.env.PORT;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIP_BACKEND_KEY);

app.use(express.json());

const allowedOrigins = [
  "https://shopper-frontend-chi.vercel.app",
  "https://shopper-admin-psi.vercel.app",
  "http://localhost:5174",
  "https://localhost:5173",
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
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type"], // Specify allowed headers
  })
);

// Serve static files from 'public' directory
app.use("/Images", express.static(path.join(__dirname, "Upload/Images")));


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

app.get("/", (req, res) => {
  res.send("Express App is Running");
});

const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Configure Cloudinary with the URL
cloudinary.config({
  url: process.env.CLOUDINARY_URL,
});

// Use multer to handle file uploads as streams
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory

// Image upload endpoint
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Convert buffer to stream
  const stream = streamifier.createReadStream(req.file.buffer);

  // Upload file to Cloudinary
  cloudinary.uploader
    .upload_stream({ resource_type: "auto" }, (error, result) => {
      if (error) {
        return res.status(500).json({ error: "Error uploading file" });
      }
      res.json({
        success: 1,
        image_url: result.secure_url, // Cloudinary URL
      });
    })
    .end(req.file.buffer);
});


const Product = mongoose.model("Product", {
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
  popular: { type: Boolean, default: false }, // New field added
});

app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 40; // Start id from 40 if no products exist
  }

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
});


app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({
    success: true,
    name: req.body.name,
  });
});

app.get("/allproduct", async (req, res) => {
  let products = await Product.find({});
  res.send(products);
});

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

// Get Single Product by ID Endpoint
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

// New collection Endpoint
app.get("/newcollections", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ date: -1 }).limit(8); // Fetch the 8 latest products
    console.log("New Collections Fetched");
    res.json(products); // Send the products as a response
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({ message: "Failed to fetch new collections" });
  }
});

//Endpoint to fetch popular Products
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

app.post("/togglePopular", async (req, res) => {
  const { id, isPopular } = req.body;
  try {
    // Assuming `Product` is your model
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

// Route to update all products with the 'popular' field use Thunder-client POST request to update all existing fields
app.post('/update-all-products', async (req, res) => {
  try {
    const result = await Product.updateMany({}, { $set: { popular: false } });
    res.json({
      success: true,
      message: `Updated ${result.nModified} products`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating products' });
  }
});

app.post("/updateproduct", async (req, res) => {
  const { id, name, old_price, new_price, category } = req.body;

  try {
    // Use `findOneAndUpdate` to match by `id`, not `_id`
    const updatedProduct = await Product.findOneAndUpdate(
      { id }, // Matching the product by `id` field
      {
        name,
        old_price,
        new_price,
        category,
      },
      { new: true } // Return the updated product
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


app.listen(port, (error) => {
  if (!error) {
    console.log("Server running on port: " + port);
  } else {
    console.log("Error: " + error);
  }
});
