import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  Close,
  Image as ImageIcon,
} from "@mui/icons-material";

function ProductForm({
  form,
  image,
  imagePreview,
  editingId,
  fileInputRef,
  onChange,
  onImageChange,
  onClearImage,
  onSubmit,
  onClear,
}) {
  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 3 }}
        >
          {editingId
            ? "Edit Product"
            : "Add Product"}
        </Typography>

        <Box
          component="form"
          onSubmit={onSubmit}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 2,
            }}
          >
            {/* PRODUCT NAME */}

            <TextField
              label="Product Name"
              name="ProductName"
              value={form.ProductName}
              onChange={onChange}
              required
              fullWidth
              inputProps={{
                maxLength: 200,
              }}
            />

            {/* PRICE */}

            <TextField
              label="Price"
              name="Price"
              type="number"
              value={form.Price}
              onChange={onChange}
              required
              fullWidth
              inputProps={{
                min: 0,
                step: "0.01",
              }}
            />

            {/* DESCRIPTION */}

            <TextField
              label="Description"
              name="Description"
              value={form.Description}
              onChange={onChange}
              multiline
              rows={4}
              fullWidth
              sx={{
                gridColumn: {
                  xs: "auto",
                  md: "1 / -1",
                },
              }}
              inputProps={{
                maxLength: 1000,
              }}
            />

            {/* IMAGE */}

            <Box
              sx={{
                gridColumn: {
                  xs: "auto",
                  md: "1 / -1",
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
              >
                Product Image
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                  gap: 2,
                }}
              >
                {/* IMAGE PREVIEW */}

                <Box
                  sx={{
                    width: 180,
                    height: 180,
                    border:
                      "1px dashed #bdbdbd",
                    borderRadius: 2,
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    overflow: "hidden",
                    bgcolor: "#fafafa",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  {imagePreview ? (
                    <>
                      <Box
                        component="img"
                        src={imagePreview}
                        alt="Product Preview"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />

                      <IconButton
                        size="small"
                        onClick={
                          onClearImage
                        }
                        sx={{
                          position:
                            "absolute",
                          top: 5,
                          right: 5,
                          bgcolor:
                            "rgba(255,255,255,0.9)",
                          "&:hover": {
                            bgcolor: "white",
                          },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <Stack
                      alignItems="center"
                      spacing={1}
                      color="text.secondary"
                    >
                      <ImageIcon
                        sx={{
                          fontSize: 45,
                        }}
                      />

                      <Typography
                        variant="caption"
                      >
                        No image selected
                      </Typography>
                    </Stack>
                  )}
                </Box>

                {/* IMAGE INPUT */}

                <Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      onImageChange
                    }
                  />

                  <Button
                    variant="outlined"
                    startIcon={
                      <ImageIcon />
                    }
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    Choose Image
                  </Button>

                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Supported formats:
                    JPEG, PNG, WEBP
                  </Typography>

                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    Maximum size: 5 MB
                  </Typography>

                  {editingId && (
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Leave empty to keep
                      the existing image.
                    </Typography>
                  )}

                  {image && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{
                        mt: 1,
                        fontWeight: 500,
                      }}
                    >
                      Selected:{" "}
                      {image.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* BUTTONS */}

          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-end"
            sx={{ mt: 3 }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={onClear}
            >
              Clear
            </Button>

            <Button
              type="submit"
              variant="contained"
            >
              {editingId
                ? "Update Product"
                : "Create Product"}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ProductForm;