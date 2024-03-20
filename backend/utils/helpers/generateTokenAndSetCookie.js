import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateTokenAndSetCookie = (userId,res) => {
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn: "17d",
    });

    res.cookie("jwt",token,{
        httpOnly: true, //This cookie can't be accessed by the browser
        maxAge: 17*24*60*60*1000, //17 days
        sameSite: "strict", //CSRF
    });

    return token;
}

export default generateTokenAndSetCookie;