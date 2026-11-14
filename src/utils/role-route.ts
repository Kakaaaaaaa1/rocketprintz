import type { Href } from "expo-router";

/*
 * Halaman yang dimiliki setiap peran.
 *
 * Beberapa halaman memakai nama yang sama di lebih dari satu peran
 * (misalnya /materials dimiliki Admin dan Operator). Saat halaman
 * dimuat ulang (refresh) di peramban, sistem bisa membuka halaman milik
 * peran lain. Daftar ini dipakai untuk mengarahkan pengguna ke halaman
 * dengan nama yang sama milik perannya sendiri.
 */
const ROLE_PAGES: Record<string, string[]> = {
  admin: ["orders", "planning", "materials", "users"],
  operator: ["planning", "running", "materials"],
  supervisor: ["orders", "planning", "running"],
};

export function getRoleRedirect(
  role: string | undefined,
  pathname: string
): Href {
  const page = pathname.split("/").filter(Boolean).pop() ?? "";

  if (role && ROLE_PAGES[role]?.includes(page)) {
    return `/(${role})/${page}` as Href;
  }

  return "/";
}
