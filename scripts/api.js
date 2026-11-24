const BASE_URL = 'https://dummyjson.com';

// ShopEdge → DummyJSON category mapping
export const CATEGORY_MAP = {
  all: null,
  shoes: ['mens-shoes', 'womens-shoes'],
  clothing: ['mens-shirts', 'womens-dresses', 'tops'],
  accessories: ['womens-jewellery', 'sunglasses', 'mens-watches', 'womens-watches'],
  beauty: ['beauty', 'fragrances', 'skin-care'],
  bags: ['womens-bags'],
};

export async function fetchAllProducts(limit = 20, skip = 0) {
  try {
    const resp = await fetch(`${BASE_URL}/products?limit=${limit}&skip=${skip}`);
    if (!resp.ok) return { products: [], total: 0 };
    return resp.json();
  } catch {
    return { products: [], total: 0 };
  }
}

export async function fetchProductsByCategory(categorySlug, limit = 12) {
  try {
    const categories = CATEGORY_MAP[categorySlug];
    if (!categories) {
      const data = await fetchAllProducts(limit);
      return data.products;
    }
    const results = await Promise.all(
      categories.map((cat) =>
        fetch(`${BASE_URL}/products/category/${cat}`)
          .then((r) => r.json())
          .then((d) => d.products || [])
          .catch(() => [])
      )
    );
    return results.flat().slice(0, limit);
  } catch {
    return [];
  }
}

export async function fetchProductsByApiCategory(apiCategory, limit = 12) {
  try {
    const resp = await fetch(`${BASE_URL}/products/category/${apiCategory}?limit=${limit}`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.products;
  } catch {
    return [];
  }
}

export async function fetchProductById(id) {
  try {
    const resp = await fetch(`${BASE_URL}/products/${id}`);
    if (!resp.ok) return null;
    return resp.json();
  } catch {
    return null;
  }
}

export async function fetchProductsByIds(ids) {
  try {
    const results = await Promise.all(ids.map((id) => fetchProductById(id)));
    return results.filter(Boolean);
  } catch {
    return [];
  }
}

export async function searchProducts(query, limit = 20) {
  try {
    const resp = await fetch(`${BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.products;
  } catch {
    return [];
  }
}

export async function fetchFeaturedProducts(limit = 4) {
  try {
    const resp = await fetch(`${BASE_URL}/products?limit=${limit}&skip=0&sortBy=rating&order=desc`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.products;
  } catch {
    return [];
  }
}

export async function getCartWithDetails() {
  try {
    const cart = JSON.parse(localStorage.getItem('shopedge-cart') || '[]');
    if (!cart.length) return [];
    const products = await fetchProductsByIds(cart.map((item) => item.id));
    return cart.map((item) => {
      const product = products.find((p) => p.id === item.id);
      return { ...item, product };
    }).filter((item) => item.product);
  } catch {
    return [];
  }
}

export function addToCart(product, qty = 1) {
  const cart = JSON.parse(localStorage.getItem('shopedge-cart') || '[]');
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: product.id, qty });
  }
  localStorage.setItem('shopedge-cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function removeFromCart(productId) {
  const cart = JSON.parse(localStorage.getItem('shopedge-cart') || '[]');
  localStorage.setItem('shopedge-cart', JSON.stringify(
    cart.filter((item) => item.id !== productId)
  ));
  window.dispatchEvent(new Event('cart-updated'));
}

export function updateCartQty(productId, qty) {
  const cart = JSON.parse(localStorage.getItem('shopedge-cart') || '[]');
  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.qty = qty;
    if (item.qty <= 0) return removeFromCart(productId);
  }
  localStorage.setItem('shopedge-cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
}

export function getCartCount() {
  const cart = JSON.parse(localStorage.getItem('shopedge-cart') || '[]');
  return cart.reduce((total, item) => total + item.qty, 0);
}

export function getCartTotal(cartWithDetails) {
  return cartWithDetails.reduce(
    (total, item) => total + item.product.price * item.qty, 0
  ).toFixed(2);
}