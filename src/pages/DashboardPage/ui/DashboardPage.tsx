import { useEffect, useState, useCallback } from "react";
import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../shared/utils";
import { setSpeed, runSequence, resetWorld } from "entities/manipulator";
import { ManipulatorGrid } from "entities/manipulator";
import type { Sample } from "entities/manipulator";
import { CommandForm, optimize } from "features/commands";
import { SpeedControl } from "features/speed";
import { useAddMutation } from "widgets/history";
import { HistoryTable } from "widgets/history";
import { logout } from "features/auth";

const DashboardPage = () => {
  const sim = useAppSelector((s) => s.simulator);
  const dispatch = useAppDispatch();
  const [add] = useAddMutation();

  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    dispatch(resetWorld());
  }, [dispatch]);

  const onOptimized = useCallback(
    async (o: ReturnType<typeof optimize>) => {
      const samplesBefore: Sample[] = sim.samples.map((s) => ({ ...s }));
      const res = await dispatch(runSequence(o.final)).unwrap();

      await add({
        raw: o.normalized,
        optimized: o.final,
        samplesBefore,
        samplesAfter: res.finalSamples as Sample[],
        success: res.ok,
        message: res.message,
      });

      setSnack({
        open: true,
        msg: res.ok
          ? "Операция выполнена успешно"
          : res.message || "Ошибка выполнения",
        severity: res.ok ? "success" : "error",
      });
    },
    [sim.samples, dispatch, add]
  );

  const handleSpeedChange = useCallback(
    (v: number) => dispatch(setSpeed(v)),
    [dispatch]
  );

  const handleLogout = () => dispatch(logout());

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "#fff",
        pt: { xs: "70px", md: "100px" },
        overflowX: "hidden",
        position: "relative",
        px: { xs: 1, sm: 2 },
      }}
    >
      <Box sx={{ position: "absolute", top: 10, right: 15 }}>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={handleLogout}
          disabled={sim.running}
          sx={{
            minWidth: { xs: 70, sm: 100 },
            fontSize: { xs: "0.75rem", sm: "0.9rem" },
          }}
        >
          Выйти
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "flex-start",
          gap: { xs: 2, md: 3 },
          width: "100%",
          maxWidth: 1200,
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: { xs: "100%", sm: 350 },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              textAlign: { xs: "center", md: "left" },
              fontSize: { xs: "1rem", sm: "1.3rem" },
            }}
          >
            Управление
          </Typography>

          <CommandForm onOptimized={onOptimized} />

          <SpeedControl value={sim.speedMs} onChange={handleSpeedChange} />

          <Button
            variant="outlined"
            onClick={() => dispatch(resetWorld())}
            disabled={sim.running}
            fullWidth
            sx={{ py: { xs: 0.8, sm: 1 } }}
          >
            Новые образцы
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#fff",
            width: { xs: "95vw", sm: 400 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              fontSize: { xs: "0.9rem", sm: "1.1rem" },
              textAlign: "center",
            }}
          >
            Стол лаборатории
          </Typography>

          <ManipulatorGrid
            gridSize={sim.gridSize}
            pos={sim.pos}
            samples={sim.samples}
            carrying={sim.carrying}
          />
        </Box>
      </Box>

      <Box
        sx={{
          mt: 5,
          width: "100%",
          maxWidth: 1600,
          px: { xs: 1, sm: 3 },
          boxSizing: "border-box",
          overflowX: "auto",
        }}
      >
        <HistoryTable />
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
