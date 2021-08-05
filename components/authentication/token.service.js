const sendAuthToken = (controller, user, statusCode, res) => {
  const token = user.getAuthJwtToken();
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  let message;
  if (controller === "register") {
    message = "Account created successfully";
  }

  //remove the password from the output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({ success: true, token, data: user, message });
};
module.exports = { sendAuthToken };
