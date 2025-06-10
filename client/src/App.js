// --- App.js (React frontend) ---
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";

const ADMIN_TOKEN = "letmein";

const ProductList = ({ products }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
    {products.map((p) => (
      <div
        key={p.id}
        className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center relative"
      >
        <img src={p.image} alt={p.title} className="w-40 h-auto mb-4" />
        <h3 className="text-lg font-semibold text-center">{p.title}</h3>
        <p className="text-green-600 font-bold my-2">{p.price}</p>
        <Link
          to={`/product/${p.id}`}
          className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          View Product
        </Link>
      </div>
    ))}
  </div>
);

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/product/${productId}`).then((res) => {
      setProduct(res.data);
    });
  }, [productId]);

  if (!product) return <p className="text-center mt-10">Loading...</p>;
  if (product.error) return <p className="text-center mt-10">Product not found</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">{product.title}</h2>
      <img
        src={product.image}
        alt={product.title}
        className="w-full max-w-xs mx-auto mb-4"
      />
      <p className="text-xl text-green-600 font-semibold mb-4">{product.price}</p>
      <a
        href={product.url}
        target="_blank"
        rel="noreferrer"
        className="block text-center bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
      >
        Buy on Amazon
      </a>
      <p className="text-xs text-center text-gray-400 mt-4">
        As an Amazon Associate, I earn from qualifying purchases.
      </p>

      {product.review && (
        <div className="mt-6 bg-white p-4 rounded border border-yellow-200">
          <p className="text-sm text-gray-800 italic">{product.review}</p>
        </div>
      )}
    </div>
  );
};

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_TOKEN) {
      navigate("/admin?token=" + ADMIN_TOKEN);
    } else {
      alert("Incorrect password.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          className="w-full border px-4 py-2 rounded mb-4"
        />
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

const AdminPage = ({ setProducts }) => {
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [localProducts, setLocalProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/products");
      setLocalProducts(res.data);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/add-product", {
        url: link,
      });
      if (res.data && !res.data.error) {
        setLocalProducts((prev) => [res.data, ...prev]);
        setProducts((prev) => [res.data, ...prev]);
        setLink("");
        setMessage("✅ Product added!");
      } else {
        setMessage("❌ Failed to add product.");
      }
    } catch (err) {
      setMessage("❌ Server error.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`http://localhost:8000/product/${id}`);
      const updated = localProducts.filter((p) => p.id !== id);
      setLocalProducts(updated);
      setProducts(updated);
    } catch (err) {
      alert("Failed to delete product.");
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste Amazon link"
          className="flex-1 border px-4 py-2 rounded"
        />
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>
      <p className="mt-2 text-sm text-gray-600">{message}</p>

      <h3 className="text-lg font-semibold mt-8">Products:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {localProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white shadow-md rounded-lg p-4 relative"
          >
            <button
              onClick={() => handleDelete(p.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Delete"
            >
              🗑️
            </button>
            <img
              src={p.image}
              alt={p.title}
              className="w-40 h-auto mx-auto mb-2"
            />
            <h3 className="text-md font-bold text-center">{p.title}</h3>
            <p className="text-green-600 font-semibold mb-2 text-center">{p.price}</p>
            <Link
              to={`/product/${p.id}`}
              className="block text-center text-blue-600 hover:underline"
            >
              View Product
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    axios.get("http://localhost:8000/products").then((res) => {
      setProducts(res.data);
    });
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="max-w-6xl mx-auto p-6">
            <header className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Affiliate Products</h1>
              <Link
                to="/admin-login"
                className="text-blue-600 hover:underline"
              >
                Admin Login
              </Link>
            </header>
            <ProductList products={products} />
            <p className="text-xs text-center text-gray-500 mt-8">
              As an Amazon Associate, I earn from qualifying purchases.
            </p>
          </div>
        }
      />
      <Route path="/product/:productId" element={<ProductPage />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          token === ADMIN_TOKEN ? (
            <AdminPage setProducts={setProducts} />
          ) : (
            <p className="text-center mt-10 text-red-500">Not authorized</p>
          )
        }
      />
    </Routes>
  );
}

export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}