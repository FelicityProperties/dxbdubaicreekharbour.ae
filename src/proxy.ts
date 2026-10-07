import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * /leads lists every enquiry with names and phone numbers, so it sits behind
 * a browser password prompt. The password is LEADS_PASSWORD in Vercel; if it
 * isn't set the page stays shut rather than open.
 */
export function proxy(request: NextRequest) {
  const expected = process.env.LEADS_PASSWORD;
  if (!expected) return new NextResponse("Leads page is not set up: add LEADS_PASSWORD in Vercel.", { status: 503 });

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const given = decoded.slice(decoded.indexOf(":") + 1);
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) return NextResponse.next();
  }

  return new NextResponse("Password required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Leads", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/leads", "/leads/:path*"],
};
