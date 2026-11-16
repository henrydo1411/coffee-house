export const notFound = (req, res) =>
  res.status(404).json({ message: "API route not found" });
export default function errorHandler(err, req, res, next) {
  let status = err.statusCode || err.status || 500;
  let message = err.message || "Something went wrong";
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid value or ID";
  }
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }
  if (err.code === 11000) {
    status = 409;
    message = "This email or name already exists";
  }
  if (status >= 500) {
    console.error(err);
    message = "Server error. Please try again.";
  }
  res.status(status).json({ message });
}
