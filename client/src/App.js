import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";

const ProductList = ({ products }) => {
  if (!products || products.length === 0) {
    return <p className="text-center mt-8 text-gray-600">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
      {products.map((p) => (
        <div key={p.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center relative">
          <img src={p.image} alt={p.title} className="w-40 h-auto mb-4 rounded-md" />
          <h3 className="text-lg font-semibold text-center mt-2">{p.title}</h3>
          <p className="text-green-600 font-bold my-2">{p.price}</p>
          <Link
            to={`/product/${p.id}`}
            className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
          >
            View Product
          </Link>
        </div>
      ))}
    </div>
  );
};

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => {
        if (data[productId]) {
          setProduct(data[productId]);
        } else {
          setError("Product not found.");
        }
      })
      .catch((err) => {
        console.error("Error loading product:", err);
        setError("Could not load product.");
      })
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <p className="text-center mt-10 text-xl text-blue-600">Loading product details...</p>;
  if (error) return <p className="text-center mt-10 text-xl text-red-500">{error}</p>;
  if (!product) return <p className="text-center mt-10 text-xl text-gray-600">Product not found.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-lg border-t-4 border-blue-500">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-4 text-center">{product.title}</h2>
      <img src={product.image} alt={product.title} className="w-full max-w-xs mx-auto mb-6 rounded-lg shadow-md" />
      <p className="text-2xl text-green-700 font-bold mb-6 text-center">{product.price}</p>
      <a
        href={product.url}
        target="_blank"
        rel="noreferrer noopener"
        className="block text-center bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
      >
        Buy on Amazon
      </a>
      <p className="text-xs text-center text-gray-500 mt-4">
        As an Amazon Associate, I earn from qualifying purchases.
      </p>
      {product.review && (
        <div className="mt-8 bg-yellow-50 p-5 rounded-lg border border-yellow-200 shadow-inner">
          <p className="text-sm text-gray-800 italic leading-relaxed">"{product.review}"</p>
        </div>
      )}
    </div>
  );
};

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = () => {
      fetch(`/products.json?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          const newProducts = Object.values(data).reverse();
          setProducts((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(newProducts)) {
              return newProducts;
            }
            return prev;
          });
        })
        .catch((err) => {
          console.error("Error loading products:", err);
          setError("Failed to load products.");
        })
        .finally(() => setLoading(false));
    };

    setLoading(true);
    fetchProducts();
    const intervalId = setInterval(fetchProducts, 1000000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <Routes>
        <Route
          path="/"
          element={
            <div className="max-w-6xl mx-auto p-6">
              <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
                <h1 className="text-3xl font-extrabold text-blue-700">Affiliate Products</h1>
              </header>
              {loading ? (
                <p className="text-center mt-10 text-xl text-blue-600">Loading products...</p>
              ) : error ? (
                <p className="text-center mt-10 text-xl text-red-500">{error}</p>
              ) : (
                <ProductList products={products} />
              )}
              <p className="text-xs text-center text-gray-500 mt-12 p-4 bg-white rounded-lg shadow-sm">
                As an Amazon Associate, I earn from qualifying purchases.
              </p>
            </div>
          }
        />
        <Route path="/product/:productId" element={<ProductPage />} />
      </Routes>
    </div>
  );
}

export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
