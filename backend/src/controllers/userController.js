import User from "../models/User.js";
import { text, emailValue, fail } from "../utils/helpers.js";
export async function getUsers(req, res) {
  res.json(await User.find().select("-password").sort({ createdAt: -1 }));
}
export async function updateUser(req, res) {
  const { role } = req.body;
  if (!["admin", "customer"].includes(role)) throw fail(400, "Invalid role");
  if (String(req.user._id) === req.params.id && role !== "admin")
    throw fail(400, "You cannot remove your own admin role");
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: text(req.body.name, "Name", 100),
      email: emailValue(req.body.email),
      role,
    },
    { returnDocument: "after", runValidators: true },
  ).select("-password");
  if (!user) throw fail(404, "User not found");
  res.json(user);
}
export async function deleteUser(req, res) {
  if (String(req.user._id) === req.params.id)
    throw fail(400, "You cannot delete your own account");
  const user = await User.findById(req.params.id);
  if (!user) throw fail(404, "User not found");
  if (user.role === "admin")
    throw fail(400, "Change this admin to customer before deleting");
  await user.deleteOne();
  res.json({ message: "User deleted" });
}
