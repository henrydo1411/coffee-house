import jwt from "jsonwebtoken";
import User from "../models/User.js";
export async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer "))
    return res.status(401).json({ message: "Please log in" });
  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    return res
      .status(401)
      .json({ message: "Session expired. Please log in again." });
  }
  try {
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res.status(401).json({ message: "Account no longer exists" });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
export function admin(req, res, next) {
  if (req.user?.role === "admin") return next();
  res.status(403).json({ message: "Admin access required" });
}
