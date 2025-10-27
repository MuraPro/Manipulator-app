import { Button, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { optimize } from "../lib/optimizer";

type Props = {
  onOptimized: (o: { normalized: string; rle: string; final: string }) => void;
};

const CommandForm = ({ onOptimized }: Props) => {
  const { register, handleSubmit, reset, watch } = useForm<{ cmd: string }>({
    defaultValues: { cmd: "" },
  });

  const cmd = watch("cmd");
  const [lastRes, setLastRes] = useState<{
    normalized: string;
    rle: string;
    final: string;
  } | null>(null);
  const res = optimize(cmd);

  const onSubmit = () => {
    if (!res.normalized) return;

    setLastRes(res);
    onOptimized(res);
    reset({ cmd: "" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={1}>
        <TextField
          {...register("cmd")}
          label="Введите команды (Л, П, В, Н, О, Б)"
          placeholder="Например: ЛЛЛЛВВПППОНННБ"
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!res.normalized}
        >
          Отправить
        </Button>

        {lastRes && (
          <>
            <Tooltip
              title="Нормализованная последовательность (недопустимые символы отброшены)"
              placement="top-start"
              arrow
            >
              <Typography variant="body2">
                Нормализовано: <b>{lastRes.normalized}</b>
              </Typography>
            </Tooltip>

            <Typography variant="body2">
              Итоговая оптимизация: <b>{lastRes.final}</b>
            </Typography>
          </>
        )}
      </Stack>
    </form>
  );
};

export default CommandForm;
