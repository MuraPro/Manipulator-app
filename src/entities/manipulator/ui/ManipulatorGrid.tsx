import { Box } from "@mui/material";
import type { Pos, Sample } from "../model/types/types";

type Props = {
  gridSize: number;
  pos: Pos;
  samples: Sample[];
  carrying: boolean;
};

const ManipulatorGrid = ({ gridSize, pos, samples, carrying }: Props) => {
  const cell = 40;
  return (
    <Box
      sx={{
        position: "relative",
        width: gridSize * cell,
        height: gridSize * cell,
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: gridSize }).map((_, y) =>
        Array.from({ length: gridSize }).map((_, x) => (
          <Box
            key={`${x}-${y}`}
            sx={{
              position: "absolute",
              left: x * cell,
              top: y * cell,
              width: cell,
              height: cell,
              borderRight: "1px solid #f1f5f9",
              borderBottom: "1px solid #f1f5f9",
            }}
          />
        ))
      )}
      {samples.map((s, idx) => (
        <Box
          key={idx}
          sx={{
            position: "absolute",
            left: s.x * cell + 10,
            top: s.y * cell + 10,
            width: 20,
            height: 20,
            borderRadius: "50%",
            bgcolor: "secondary.main",
            boxShadow: 1,
          }}
        />
      ))}
      <Box
        sx={{
          position: "absolute",
          left: pos.x * cell + 4,
          top: pos.y * cell + 4,
          width: cell - 8,
          height: cell - 8,
          borderRadius: 2,
          bgcolor: "primary.main",
          color: "white",
          fontSize: 12,
          display: "grid",
          placeItems: "center",
          transition: "left 150ms linear, top 150ms linear",
        }}
      >
        {carrying ? "🖐️•●" : "🖐️"}
      </Box>
    </Box>
  );
};

export default ManipulatorGrid;
