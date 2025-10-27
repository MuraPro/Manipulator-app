import { useEffect } from "react";
import { LoginForm, restoreAuth } from "features/auth";
import { DashboardPage } from "pages/DashboardPage";
import { useAppDispatch, useAppSelector } from "../shared/utils";

const App = () => {
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector((s) => s.auth.isAuth);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  return isAuth ? <DashboardPage /> : <LoginForm />;
};

export default App;
