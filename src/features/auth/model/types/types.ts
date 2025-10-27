export type User = {
  username: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuth: boolean;
};
