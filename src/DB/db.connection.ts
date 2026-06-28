import { connect } from "mongoose"

const connectDB = async () => {
    const atlasConnection = process.env.MONGO_URI
    try {
        await connect(`${atlasConnection}/${process.env.MONGO_DATABASE}`)
        console.log("Database connected")
    } catch (error) {
        console.log(error)
    }
}

export default connectDB