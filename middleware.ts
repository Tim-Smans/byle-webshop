import { NextResponse } from "next/server";
import { verifyAdminSession }
  from "@/lib/auth/admin-session";

export async function middleware(
  req: Request
) {
  // const url = new URL(req.url);

  // if (!url.pathname.startsWith("/admin")) {
  //   return NextResponse.next();
  // }

  // if (
  //   url.pathname === "/admin/login"
  // ) {
  //   console.log("Logging user i")
  //   return NextResponse.next();
  // }

  // const cookie =
  //   req.headers
  //     .get("cookie")
  //     ?.split("; ")
  //     .find(c =>
  //       c.startsWith(
  //         "admin_session="
  //       )
  //     )
  //     ?.split("=")[1];

  // if (!cookie) {
  //   return NextResponse.redirect(
  //     new URL("/admin/login", url)
  //   );
  // }

  // const valid =
  //   await verifyAdminSession(cookie);

  // if (!valid) {
  //   return NextResponse.redirect(
  //     new URL("/admin/login", url)
  //   );
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};