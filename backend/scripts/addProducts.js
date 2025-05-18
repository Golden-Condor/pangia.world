require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("✅ Connected to MongoDB");

        // Insert sample water products with extra details
        const products = [
            {
                name: "Experience True Purity",
                description: "Sourced from pristine springs, this water offers a crisp, refreshing taste with no additives.",
                price: 2.99,
                image: "/water/images/Avl-bottle.jpeg",
                stock: 100
            },
            {
                name: "New Jugs (5 Gallons)",
                description: "Naturally filtered and perfect for large gatherings or offices.",
                price: 15.50,
                image: "/water/images/avl-singlejug.jpeg",
                stock: 50
            },
            {
                name: "Jug Exchanges",
                description: "An economical way to ensure you always have fresh water, with our jug exchange service.",
                price: 9.00,
                image: "/water/images/avl-jugexchange.webp",
                stock: 75
            }
        ];

        const inserted = await Product.insertMany(products);
        console.log("✅ Sample Products Inserted:", inserted);

        mongoose.connection.close();
    })
    .catch(err => console.error("❌ MongoDB Connection Failed:", err));