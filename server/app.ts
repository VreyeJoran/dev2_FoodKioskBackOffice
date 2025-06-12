import express, { Application } from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import routes from "./routes/index";
import apiRoutes from "./apiRoutes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(<string>process.env.PORT, 10) || 3000;

app.use(cors());

// EJS as template-engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for layouts
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Middleware for static files
app.use(express.static(path.join(__dirname, "/public")));

app.use(express.json());

// Middleware for forms
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use("/", routes);

// Use API routes
app.use("/api", apiRoutes);

// Start Server
app.listen(PORT, (): void => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
