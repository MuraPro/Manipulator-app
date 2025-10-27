import { Slider, Stack, Typography } from "@mui/material";

type Props = { value: number; onChange: (v: number) => void };

const SpeedControl = ({ value, onChange }: Props) => {
  return (
    <Stack>
      <Typography variant="body2">Скорость (мс/шаг): {value}</Typography>
      <Slider
        min={100}
        max={1000}
        step={50}
        value={value}
        onChange={(_, v) => onChange(v as number)}
      />
    </Stack>
  );
};

export default SpeedControl;
