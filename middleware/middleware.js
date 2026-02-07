// Auth middleware for protected routes
const authMiddleware = (publicPaths = []) => {
  return (req, res, next) => {
    try {
      const path = req.path;
      const token = req.cookies?.token || "";
      const isPublicPath = publicPaths.includes(path);

      if (token && isPublicPath) return res.redirect("/profile");
      if (!token && !isPublicPath) return res.redirect("/login");

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(500).send("Internal Server Error");
    }
  };
};

export default authMiddleware