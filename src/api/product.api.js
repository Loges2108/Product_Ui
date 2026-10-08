import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

export const getProducts = async () => {
  const response = await api.get("/products");

  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);

  return response.data;
};

export const createProduct = async (formData) => {
  const response = await api.post(
    "/products",
    formData
  );

  return response.data;
};

export const updateProduct = async (
  id,
  formData
) => {
  const response = await api.put(
    `/products/${id}`,
    formData
  );

  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(
    `/products/${id}`
  );

  return response.data;
};

export default api;