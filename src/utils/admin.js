const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  //get the token from the header if present
  if (!req.headers['x-access-token']) {
    return res.status(403).json({
      status: 403,
      message: 'FORBIDDEN'
    });
  }
  const token = req.headers["x-access-token"] || req.headers["authorization"];
  //if no token found, return response (without going to the next middelware)
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    //if can verify the token, set req.user and pass to next middleware
    const decoded = jwt.verify(token, "mysecretkey");
    req.user = decoded;
    console.log(req.user);

    if (req.user.isAdmin == true) {
      console.log(req.user.category, req.user.isAdmin);
      next();
    } else {
      res.status(401).send('Access denied. You are not an Admin.');
    }
  } catch (err) {
    //if invalid token
    console.log(err);
    res.status(400).send("Invalid or expired token.");
  }
};