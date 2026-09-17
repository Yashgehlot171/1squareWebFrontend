import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import { IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { EmptyState } from "../../../components/common/EmptyState";
import { StatusBadge } from "../../../components/common/StatusBadge";
import type { MasterColumnConfig, MasterRecord } from "../types";
import { StatusToggle } from "./StatusToggle";

interface MasterDataTableProps {
  rows: MasterRecord[];
  columns: MasterColumnConfig[];
  onEdit: (record: MasterRecord) => void;
  onDelete: (record: MasterRecord) => void;
  onToggleStatus: (record: MasterRecord, status: string) => void;
}

type SortDirection = "asc" | "desc";

const stringValue = (value: unknown) => (value === null || value === undefined ? "" : String(value));

export function MasterDataTable({ rows, columns, onEdit, onDelete, onToggleStatus }: MasterDataTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState(columns.find((column) => column.sortable)?.key ?? columns[0]?.key ?? "id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedRows = useMemo(
    () =>
      [...rows].sort((left, right) => {
        const leftValue = stringValue(left[sortKey]);
        const rightValue = stringValue(right[sortKey]);
        return sortDirection === "asc" ? leftValue.localeCompare(rightValue, undefined, { numeric: true }) : rightValue.localeCompare(leftValue, undefined, { numeric: true });
      }),
    [rows, sortDirection, sortKey],
  );

  const visibleRows = useMemo(() => sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [page, rowsPerPage, sortedRows]);

  if (!rows.length) {
    return <EmptyState title="No records found" description="Create a new master record or change your search/filter criteria." />;
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: "calc(100vh - 340px)" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} sx={{ bgcolor: "background.paper", py: 1.5 }}>
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortKey === column.key}
                      direction={sortKey === column.key ? sortDirection : "asc"}
                      IconComponent={UnfoldMoreRoundedIcon}
                      onClick={() => {
                        setSortDirection(sortKey === column.key && sortDirection === "asc" ? "desc" : "asc");
                        setSortKey(column.key);
                      }}
                    >
                      <Typography variant="subtitle2">{column.label}</Typography>
                    </TableSortLabel>
                  ) : (
                    <Typography variant="subtitle2">{column.label}</Typography>
                  )}
                </TableCell>
              ))}
              <TableCell sx={{ bgcolor: "background.paper", py: 1.5 }}>
                <Typography variant="subtitle2">Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow key={row.id} hover sx={{ "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035) } }}>
                {columns.map((column) => (
                  <TableCell key={column.key} sx={{ py: 1.35 }}>
                    {column.render ? column.render(row) : column.key === "status" ? <StatusBadge value={stringValue(row.status)} /> : stringValue(row[column.key]) || "-"}
                  </TableCell>
                ))}
                <TableCell sx={{ py: 1.35 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <StatusToggle value={stringValue(row.status ?? "Active")} onChange={(status) => onToggleStatus(row, status)} />
                    <IconButton size="small" onClick={() => onEdit(row)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
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
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
      />
    </Paper>
  );
}
