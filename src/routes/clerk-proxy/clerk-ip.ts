export function getClientIp(request: Request) {
  // Security: Prioritize cf-connecting-ip over x-forwarded-for to prevent IP spoofing when deployed behind Cloudflare.
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const addresses = forwardedFor
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (addresses.length > 0) return addresses[addresses.length - 1]!;
  }
  return "127.0.0.1";
}
