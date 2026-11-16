import mongoose from "mongoose";
export const fail = (status, message) =>
  Object.assign(new Error(message), { statusCode: status });
export const validId = (id) =>
  typeof id === "string" && mongoose.isObjectIdOrHexString(id);
export function text(value, label, max = 200, required = true) {
  if (typeof value !== "string") throw fail(400, `${label} must be text`);
  const v = value.trim();
  if (required && !v) throw fail(400, `${label} is required`);
  if (v.length > max) throw fail(400, `${label} must be at most ${max} characters`);
  return v;
}
export function emailValue(value) {
  const email = text(value, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw fail(400, "Invalid email address");
  return email;
}
