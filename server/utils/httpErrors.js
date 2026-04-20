/**
 * Send a JSON error without leaking stack / DB details in production.
 * Always logs the full error server-side.
 */
export function sendServerError(res, err, publicMessage = "Something went wrong") {
  console.error("[QuickPost]", err);
  const isProd = process.env.NODE_ENV === "production";
  const status = Number(err?.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({
    message: isProd ? publicMessage : err?.message || publicMessage,
  });
}
