import { useState, type HTMLAttributes } from "react";
import { useListQuery, useClearMutation } from "../api/historyApi";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

const HistoryTable = () => {
  const { data } = useListQuery();
  const [clear] = useClearMutation();
  const [open, setOpen] = useState(false);

  const fmt = (samples?: { x: number; y: number }[]) => {
    if (!samples?.length) return "—";

    const sorted = [...samples].sort((a, b) => a.x - b.x || a.y - b.y);

    return sorted.map((s) => `(${s.x},${s.y})`).join(" ");
  };

  const handleClear = async () => {
    await clear();
    setOpen(false);
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 1 }}
        gap={1}
      >
        <Typography variant="h6">История операций</Typography>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => setOpen(true)}
          disabled={!data?.length}
        >
          Очистить историю
        </Button>
      </Stack>

      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Дата/время</TableCell>
              <TableCell>Исходная</TableCell>
              <TableCell>Оптимизированная</TableCell>
              <TableCell>Образцы до</TableCell>
              <TableCell>Образцы после</TableCell>
              <TableCell>Результат</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data?.length ? (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {format(new Date(row.dateISO), "dd.MM.yyyy HH:mm:ss", {
                      locale: ru,
                    })}
                  </TableCell>
                  <TableCell>{row.raw}</TableCell>
                  <TableCell>{row.optimized}</TableCell>

                  <TableCell sx={{ maxWidth: 250 }}>
                    <Tooltip
                      title={fmt(row.samplesBefore)}
                      placement="top"
                      arrow
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontFamily: "monospace",
                        }}
                      >
                        {fmt(row.samplesBefore)}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 250 }}>
                    <Tooltip
                      title={fmt(row.samplesAfter)}
                      placement="top"
                      arrow
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontFamily: "monospace",
                        }}
                      >
                        {fmt(row.samplesAfter)}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    {row.success ? (
                      <Chip size="small" color="success" label="OK" />
                    ) : (
                      <Chip
                        size="small"
                        color="error"
                        label={row.message || "Ошибка"}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  align="center"
                  {...({ colSpan: 6 } as HTMLAttributes<HTMLTableCellElement>)}
                >
                  История пуста
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Очистить историю?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Это действие удалит все записи о выполненных командах без
            возможности восстановления.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button color="error" onClick={handleClear}>
            Очистить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoryTable;
