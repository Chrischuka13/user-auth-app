const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const path = req.path;

  const publicPaths = ["/login", "/signup"];
  const isPublicPath = publicPaths.includes(path);

  // 🔹 Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  // 🔹 If token exists, verify it
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY);

      // If logged in & trying to access public page
      if (isPublicPath) {
        return res.status(403).json({
          message: "You are already logged in."
        });
      }

      return next();
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token."
      });
    }
  }

  // 🔹 If NO token & trying to access protected page
  if (!token && !isPublicPath) {
    return res.status(401).json({
      message: "Please login to access this page."
    });
  }

  next();
};

export default protect
