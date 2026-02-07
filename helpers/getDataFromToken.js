import jwt from "jsonwebtoken"

//jwt helper
const getDataFromToken = (req) => {
    try {
        c

        if (!token) {
        throw new Error("No token found");
        }

        // Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

        return decodedToken.id;

    } catch (error) {
        console.error("Error getting token: ", error)
        throw new Error("Couldn't send token")
    }
}

export default getDataFromToken