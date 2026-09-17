import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import type { TableColumn } from "../../types";
import { EmptyState } from "./EmptyState";

interface AppTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
}

export function AppTable<T>({ columns, rows }: AppTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const visibleRows = useMemo(() => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [page, rows, rowsPerPage]);

  if (!rows.length) {
    return <EmptyState title="No records found" description="Try changing the search or filter criteria." />;
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: "calc(100vh - 320px)" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} sx={{ bgcolor: "background.paper", py: 1.5 }}>
                  <Typography variant="subtitle2">{column.header}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row, index) => (
              <TableRow
                hover
                key={index}
                sx={{
                  transition: "background-color 150ms ease, transform 150ms ease",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035),
                  },
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} sx={{ py: 1.35 }}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        sx={{ borderTop: 1, borderColor: "divider" }}
      />
    </Paper>
  );
}
