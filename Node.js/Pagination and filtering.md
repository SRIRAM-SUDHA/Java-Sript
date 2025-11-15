

# 📘 Pagination & Filtering + Error Handling (Express MVC)

We’ll build:

### **1. GET /products — with pagination + filtering + sorting**

### **2. Centralized error handler (`errorMiddleware.js`)**

### **3. Reusable async handler wrapper (`catchAsync.js`)**

### **4. Custom Error class (`AppError.js`)**

---

# 🗂 Folder Structure (MVC)

```
project/
  ├─ controllers/
  │    └─ productController.js
  ├─ routes/
  │    └─ productRoutes.js
  ├─ models/
  │    └─ productModel.js
  ├─ middleware/
  │    ├─ errorMiddleware.js
  │    └─ catchAsync.js
  ├─ utils/
  │    └─ AppError.js
  ├─ server.js
  └─ app.js
```

---

# 🧱 1. Pagination + Filtering Controller

### `controllers/productController.js`

```js
const Product = require("../models/productModel");
const catchAsync = require("../middleware/catchAsync");
const AppError = require("../utils/AppError");

// GET /products?price[gte]=100&price[lte]=500&sort=price&page=2&limit=10
exports.getAllProducts = catchAsync(async (req, res, next) => {
  let queryObj = { ...req.query };

  // remove fields that are not filters
  const excludeFields = ['page', 'sort', 'limit', 'fields'];
  excludeFields.forEach((el) => delete queryObj[el]);

  // filtering operators: gte, lte, lt, gt
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(
    /\b(gte|gt|lte|lt)\b/g,
    match => `$${match}`
  );

  let query = Product.find(JSON.parse(queryStr));

  // sorting
  if (req.query.sort) {
    query = query.sort(req.query.sort);
  } else {
    query = query.sort('-createdAt');
  }

  // field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const products = await query;

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});
```

---

# 🧱 2. Product Model (MongoDB Example)

### `models/productModel.js`

```js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: Number,
  category: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
```

---

# 🧱 3. Route File

### `routes/productRoutes.js`

```js
const express = require("express");
const { getAllProducts } = require("../controllers/productController");

const router = express.Router();

router.get("/", getAllProducts);

module.exports = router;
```

---

# 🧱 4. Centralized Error Handler

### `middleware/errorMiddleware.js`

```js
const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {
  console.error("ERROR 💥", err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
```

---

# 🧱 5. Reusable Async Wrapper

### `middleware/catchAsync.js`

```js
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

---

# 🧱 6. Custom Error Class

### `utils/AppError.js`

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

---

# 🧱 7. App Config

### `app.js`

```js
const express = require('express');
const productRoutes = require('./routes/productRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const AppError = require('./utils/AppError');

const app = express();

app.use(express.json());

// Routes
app.use("/products", productRoutes);

// If route not found
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});

// Central error handler
app.use(errorMiddleware);

module.exports = app;
```

---

# 🧱 8. Server File

### `server.js`

```js
const mongoose = require("mongoose");
const app = require("./app");

mongoose.connect("mongodb://localhost:27017/test-api")
  .then(() => console.log("DB connected!"))
  .catch(err => console.error(err));

app.listen(5000, () => {
  console.log("Server running on port 5000...");
});
```

---

# 🎉 Your API Now Supports:

### ✔ Pagination

`GET /products?page=2&limit=5`

### ✔ Filtering

`GET /products?price[gte]=100&price[lte]=500`

### ✔ Sorting

`GET /products?sort=price,-name`

### ✔ Field Selection

`GET /products?fields=name,price`

### ✔ Central Error Handling

All errors go to `errorMiddleware.js`

---
