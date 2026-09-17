import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader";
import { permissionGroups, permissionMatrixColumns } from "../../constants/permissions";

export function PermissionMatrixPage() {
  return (
    <>
      <PageHeader title="Permission Matrix" subtitle="Rows as modules and columns as common role actions." />
      <TableContainer sx={{ bgcolor: "background.paper", borderRadius: 3, border: 1, borderColor: "divider" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Module</TableCell>
              {permissionMatrixColumns.map((column) => (
                <TableCell key={column}>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(permissionGroups).map((module) => (
              <TableRow key={module}>
                <TableCell sx={{ textTransform: "capitalize" }}>{module}</TableCell>
                {permissionMatrixColumns.map((column) => (
                  <TableCell key={column}>
                    <Box component="span" sx={{ color: "text.secondary" }}>
                      {permissionGroups[module].some((permission) => permission.includes(column.toLowerCase())) ? "Yes" : "-"}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
