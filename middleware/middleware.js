// middleware/auth.js
const protectRoutes = (req, res, next) => {
  const path = req.path;

  const isPublicPath =
    path === "/login" || path === "/signup" || path === "/verifymail";

  const token = req.cookies?.token || "";

  // If logged in and trying to access public pages → redirect to profile
  if (token && isPublicPath) {
    return res.redirect("/profile");
  }

  // If not logged in and trying to access protected pages → redirect to login
  if (!token && !isPublicPath) {
    return res.redirect("/login");
  }

  next();
};

export default protectRoutes