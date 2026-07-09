export const isAdmin = (id: unknown) => {
  const adminIdAllowlist = (process.env.ADMIN_ID_ALLOWLIST || "")
    .split(", ")
    .map((string) => Number(string));

  return !!id && adminIdAllowlist && adminIdAllowlist.includes(Number(id));
};
