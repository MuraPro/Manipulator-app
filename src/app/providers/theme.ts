import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  typography: {
    fontSize: 14,
    h5: { fontSize: "1.2rem" },
    h6: { fontSize: "1rem" },
  },
});
