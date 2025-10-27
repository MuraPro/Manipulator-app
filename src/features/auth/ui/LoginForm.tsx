import {
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "../api/authApi";
import { useAppDispatch } from "shared/utils";
import { setAuth } from "../model/slice/authSlice";

const schema = z.object({
  username: z.string().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
});
type Form = z.infer<typeof schema>;

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
  });
  const { errors } = formState;

  const [login, { isLoading, error }] = useLoginMutation();
  const fetchError = error as FetchBaseQueryError;

  const onSubmit = async (data: Form) => {
    try {
      const res = await login(data).unwrap();
      dispatch(setAuth(res));
    } catch (e) {
      console.error("Ошибка авторизации:", e);
    }
  };

  const apiError =
    (error as { data?: { message?: string } })?.data?.message ||
    "Неверный логин или пароль";

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: { xs: "95%", sm: 360 },
          maxWidth: 400,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={2}>
            Вход в систему
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={2}>
              <TextField
                label="Логин"
                {...register("username")}
                error={!!errors.username}
                helperText={errors.username?.message}
                fullWidth
              />

              <TextField
                label="Пароль"
                type="password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
                fullWidth
              />

              {fetchError && <Alert severity="error">{apiError}</Alert>}

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? "Загрузка..." : "Войти"}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Stack>
  );
}
