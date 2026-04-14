export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  roles: string[];
};

export type RegisterRequest = {
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
  Email: string;
  Password: string;
};

export type ResetPasswordRequest = {
  email: string;
  code: string;
  newPassword: string;
};