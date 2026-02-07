
const authMiddleware = (publicPaths = []) => {
  return (req, res, next) => {
    try {
      const path = req.path;
      const token = req.cookies?.token || "";

      const isPublicPath = publicPaths.includes(path);

      // If user has token and tries to access a public page (login/signup/verifymail)
      if (token && isPublicPath) {
        return res.redirect("/profile");
      }

      // If user does not have token and tries to access a protected page
      if (!token && !isPublicPath) {
        return res.redirect("/login");
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(500).send("Internal Server Error");
    }
  };
};

export default authMiddleware;
