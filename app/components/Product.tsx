import { useEffect, useState } from "react";
import './Product.css';

// Placeholder image for products without an image
const placeholderImage = "https://upload.wikimedia.org/wikipedia/commons/0/0a/No-image-available.png";

interface ParentCategory {
  id: number;
  name: string;
  displayLabel: string;
}

interface Product {
  rating: number;
  id: number;
  sku: string;
  name: string | null;
  description: string;
  minimumOrderQuantity: number;
  maximumOrderQuantity: number;
  isTejasProduct: boolean;
  hsnCode: string | null;
  rawMaterialCost: number | null;
  workHours: number;
  hourlyWage: number;
  profitMargin: number;
  defaultLivehoodPoints: number;
  parentCategory: ParentCategory;
  images: string[];
  price: number | null;  // Updated to allow null
  index: number;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(10);

  // State to track filters
  const [filter, setFilter] = useState<string>("all"); // Options: "all", "priceNull", "placeholderImage"

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://miri-dev-api.drishtee.in/api/v1/products?isBarter=false"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || !data.data.products) {
          throw new Error("Invalid data structure from API");
        }

        const filteredProducts = data.data.products.filter(
          (product: Product) => product.name !== null
        );

        setProducts(filteredProducts);
      } catch (error) {
        setError("Failed to fetch products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products
    .filter((product) =>
      product.name?.toLowerCase().includes(search.toLowerCase())
    )
    .slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorNotification message={error} />;
  }

  // Filter current products based on the selected filter
  const filteredProducts = currentProducts.filter((product) => {
    if (filter === "priceNull") {
      return product.price !== null; // Hide products with null price
    }
    if (filter === "placeholderImage") {
      return product.images && product.images.length > 0; // Hide products with placeholder image
    }
    return true; // Show all products
  });

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Search products by name"
          className="border p-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 ml-4"
          value={filter}
          onChange={(e) => setFilter(e.target.value)} // Change filter state on selection
        >
          <option value="all">Show All</option>
          <option value="priceNull">Price Null</option>
          <option value="placeholderImage">NO Image</option>
        </select>
      </div>

      {/* Conditional rendering for grid or table */}
      <div className="product-list">
        {filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <>
            <div className="grid md:hidden">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <img
                    src={product.images.length > 0 ? product.images[0] : placeholderImage}
                    alt={product.name || "No Image"}
                    className="w-full h-24 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = placeholderImage;
                    }}
                  />
                  <h2>{product.name || "Unnamed Product"}</h2>
                  <p>{product.price !== null ? `$${product.price}` : "N/A"}</p>
                </div>
              ))}
            </div>

            <table className="min-w-full border-collapse hidden md:table">
              <thead>
                <tr>
                  <th>No.List</th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1 + (currentPage - 1) * productsPerPage}</td>
                    <td>
                      <img
                        src={product.images.length > 0 ? product.images[0] : placeholderImage}
                        alt={product.name || "No Image"}
                        className="w-24 h-24 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = placeholderImage;
                        }}
                      />
                    </td>
                    <td>{product.name || "Unnamed Product"}</td>
                    <td>{product.price !== null ? `$${product.price}` : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="flex justify-center mt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} paginate={paginate} />
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, paginate }: { currentPage: number; totalPages: number; paginate: (pageNumber: number) => void; }) => {
  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="flex justify-center space-x-2">
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-4 py-2 border rounded-md ${number === currentPage ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// Error Notification Component
const ErrorNotification = ({ message }: { message: string }) => {
  return (
    <div className="text-red-500 bg-red-100 p-4 rounded-lg">
      <p>{message}</p>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default ProductList;
