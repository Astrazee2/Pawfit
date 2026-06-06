export const getJwtSecret = () =>
  process.env.JWT_SECRET || "pawfit_local_secret";
