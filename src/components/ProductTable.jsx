import {
  Box,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  Delete,
  Edit,
  Image as ImageIcon,
} from "@mui/icons-material";

function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
}) {
  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            fontWeight={600}
          >
            Product List
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Total Products: {products.length}
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={70}>
                  ID
                </TableCell>

                <TableCell width={100}>
                  Image
                </TableCell>

                <TableCell>
                  Product Name
                </TableCell>

                <TableCell>
                  Description
                </TableCell>

                <TableCell width={140}>
                  Price
                </TableCell>

                <TableCell
                  width={150}
                  align="center"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                  >
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                  >
                    <Typography
                      color="text.secondary"
                      sx={{ py: 3 }}
                    >
                      No products found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product.ProductId}
                    hover
                  >
                    <TableCell>
                      {product.ProductId}
                    </TableCell>

                    <TableCell>
                      {product.ImageUrl ? (
                        <Box
                          component="img"
                          src={product.ImageUrl}
                          alt={
                            product.ProductName
                          }
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 1,
                            border:
                              "1px solid #ddd",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            border:
                              "1px solid #ddd",
                            borderRadius: 1,
                          }}
                        >
                          <ImageIcon
                            color="disabled"
                          />
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography
                        fontWeight={500}
                      >
                        {product.ProductName}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {product.Description ||
                        "-"}
                    </TableCell>

                    <TableCell>
                      ₹{" "}
                      {Number(
                        product.Price
                      ).toFixed(2)}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() =>
                          onEdit(product)
                        }
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        color="error"
                        size="small"
                        onClick={() =>
                          onDelete(
                            product.ProductId
                          )
                        }
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export default ProductTable;