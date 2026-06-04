export const USER_AUTH_ROUTES = {
  register: "/auth/users/register",
  login: "/auth/users/login",
  refreshSession: "/auth/users/refresh",
  logout: "/auth/users/logout",
  currentUser: "/auth/users/me",
  updateProfile: "/auth/users/profile",
  uploadProfileImage: "/auth/users/profile/image",
  forgotPassword: "/auth/users/forgot-password",
  resetPassword: "/auth/users/reset-password",
  googleLogin: "/auth/users/google",
  completeGooglePhone: "/auth/users/google/complete-phone",
} as const;
