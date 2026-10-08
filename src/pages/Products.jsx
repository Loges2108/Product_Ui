import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import { Add } from "@mui/icons-material";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/product.api";

import ProductTable from "../components/ProductTable";
import ProductForm from "../components/ProductForm";

const initialForm = {
  ProductName: "",
  Description: "",
  Price: "",
};

function Products() {
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);

  const [form, setForm] =
    useState(initialForm);

  const [image, setImage] = useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  /*
   * LOAD PRODUCTS
   */

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response =
        await getProducts();

      setProducts(response.data || []);
    } catch (error) {
      console.error(
        "Load products error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /*
   * FORM CHANGE
   */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * IMAGE CHANGE
   */

  const handleImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * Frontend validation
     */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(
      file.type
    )) {
      alert(
        "Only JPEG, PNG and WEBP images are allowed."
      );

      event.target.value = "";

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "Image size cannot exceed 5 MB."
      );

      event.target.value = "";

      return;
    }

    /*
     * Revoke previous preview
     */

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  /*
   * CLEAR IMAGE
   */

  const handleClearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  /*
   * RESET FORM
   */

  const resetForm = () => {
    setForm(initialForm);

    handleClearImage();

    setEditingId(null);
  };

  /*
   * EDIT
   */

  const handleEdit = (product) => {
    setEditingId(
      product.ProductId
    );

    setForm({
      ProductName:
        product.ProductName || "",

      Description:
        product.Description || "",

      Price:
        product.Price || "",
    });

    /*
     * No new file selected.
     */

    setImage(null);

    /*
     * Show existing S3
     * presigned image.
     */

    setImagePreview(
      product.ImageUrl || null
    );

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    };

    /*
     * Scroll to form.
     */

    setTimeout(() => {
      window.scrollTo({
        top:
          document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  /*
   * SUBMIT
   */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      !form.ProductName.trim()
    ) {
      alert(
        "Product name is required."
      );

      return;
    }

    if (
      form.Price === "" ||
      form.Price === null
    ) {
      alert("Price is required.");

      return;
    }

    try {
      const formData =
        new FormData();

      formData.append(
        "ProductName",
        form.ProductName.trim()
      );

      formData.append(
        "Description",
        form.Description
      );

      formData.append(
        "Price",
        form.Price
      );

      /*
       * Image is optional.
       */

      if (image) {
        formData.append(
          "Image",
          image
        );
      }

      if (editingId) {
        await updateProduct(
          editingId,
          formData
        );

        alert(
          "Product updated successfully."
        );
      } else {
        await createProduct(
          formData
        );

        alert(
          "Product created successfully."
        );
      }

      resetForm();

      await loadProducts();
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to save product."
      );
    }
  };

  /*
   * DELETE
   */

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this product?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(id);

      /*
       * If deleted product
       * is currently being edited,
       * clear the form.
       */

      if (editingId === id) {
        resetForm();
      }

      await loadProducts();
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete product."
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor:
          "#f5f6f8",
        p: {
          xs: 1.5,
          sm: 2,
          md: 3,
        },
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={600}
            >
              Product Management
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Environment:{" "}
              <strong>
                {import.meta.env.VITE_ENV}
              </strong>
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              API:{" "}
              {
                import.meta.env
                  .VITE_API_BASE_URL
              }
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={resetForm}
          >
            New Product
          </Button>
        </Stack>

        {/* ==================================================
            TABLE
        ================================================== */}

        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* ==================================================
            FORM
        ================================================== */}

        <Box sx={{ mt: 3 }}>
          <ProductForm
            form={form}
            image={image}
            imagePreview={imagePreview}
            editingId={editingId}
            fileInputRef={fileInputRef}
            onChange={handleChange}
            onImageChange={
              handleImageChange
            }
            onClearImage={
              handleClearImage
            }
            onSubmit={handleSubmit}
            onClear={resetForm}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Products;