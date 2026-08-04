const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "super_secret_warehouse_jwt_key_9988";
  return jwt.sign(
    { id: userId },
    secret,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;