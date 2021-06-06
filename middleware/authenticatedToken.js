const authenticatedToken = (user, statusCode, res, messagetosend) => {
  const token = user.getAuthJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token, data: user, message: messagetosend });
};
module.exports = authenticatedToken;
