import jwt from "jsonwebtoken"

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; 

  const isAuthPage = req.path === "/login" || req.path === "/signup";
  const isProfilePage = req.path === "/profile";

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY);

      // If logged in and NOT accessing profile → block
      if (isAuthPage) {
        return res.status(403).json({
          message: "You are already logged in"
        });
      }

      return next();

    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  if (!token) {
    // Block access to profile
    if (isProfilePage) {
      return res.status(401).json({
        message: "You must be logged in to access profile."
      });
    }

    // Allow other pages
    return next();
  }

};

export default protect