const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
  
    const token = req.headers.authorization.split(" ")[1];

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

  
    const user = await User.findById(decoded.id).select("-password");


    req.user = user;


    next();

  } catch (error) {
    res.status(401).json({
      message: "Not Authorized",
    });
  }
};

module.exports = { protect };