import jwt from "jsonwebtoken"

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" })
        }

        const token = authHeader.split(" ")[1]

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        )

        req.user = decoded.id  // attach user to request

        next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" })
  }
};

export default protect