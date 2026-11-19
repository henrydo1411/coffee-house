import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { text, emailValue, fail } from "../utils/helpers.js";
const responseUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});
const session = (user) => ({
  ...responseUser(user),
  token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  }),
});
export async function register(req, res) {
  const name = text(req.body.name, "Name", 100);
  const email = emailValue(req.body.email);
  const password = req.body.password;
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 72
  )
    throw fail(400, "Password must contain 8–72 characters");
  if (await User.exists({ email })) throw fail(409, "Email already registered");
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: "customer",
  });
  res.status(201).json(session(user));
}
export async function login(req, res) {
  const email = emailValue(req.body.email);
  const password = req.body.password;
  if (typeof password !== "string" || !password || password.length > 72)
    throw fail(400, "Password is required (maximum 72 characters)");

  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.password || !(await bcrypt.compare(password, user.password)))
    throw fail(401, "Invalid email or password");

  res.json(session(user));
}
export function me(req, res) {
  res.json(responseUser(req.user));
}
