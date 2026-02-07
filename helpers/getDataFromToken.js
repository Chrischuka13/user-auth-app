import jwt from "jsonwebtoken"

const getDataFromToken = (req) => {
    try {
        const token = req.cookies.token || ""
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)

        return decodedToken.id

    } catch (error) {
        console.error("Error getting token: ", error)
        throw new Error("Couldn't send token")
    }
}

export default getDataFromToken