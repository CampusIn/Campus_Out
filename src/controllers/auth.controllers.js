import userModel from "../models/user.models.js";
import sessionModel from "../models/session.models.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/email.services.js";
import { generateOTP, generateOtpHTML } from "../utils/utils.js";
import otpModel from "../models/otp.models.js";
import ApiError from "../utils/apiErrors.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const clearRefreshTokenCookieOptions = {
  httpOnly: refreshTokenCookieOptions.httpOnly,
  secure: refreshTokenCookieOptions.secure,
  sameSite: refreshTokenCookieOptions.sameSite,
};

const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "Username, email and password are required");
  }

  const isUserExists = await userModel.findOne({
    $or: [{ email }, { username }],
  });
  if (isUserExists) {
    throw new ApiError(409, "Username or email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await userModel.create({
    username,
    email,
    password: hashedPassword,
    role,
  });

  const otp = generateOTP();
  const otpHTML = generateOtpHTML(otp);
  const otpHash = await bcrypt.hash(otp, 10);
  await otpModel.create({
    email,
    user: newUser._id,
    otpHash,
  });

  try {
    await sendEmail(
      email,
      "Welcome to Campus In",
      "Thank you for registering with us!",
      otpHTML,
    );
  } catch (error) {
    console.error("Registration OTP email failed:", error.message);
    throw new ApiError(
      500,
      "Registration created, but OTP email could not be sent. Please check email service configuration.",
    );
  }

  res.status(201).json(
    new ApiResponse(
      201,
      "User registered successfully. Please verify your email",
      {
        username,
        email,
        verified: newUser.verified,
      },
    ),
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Invalid credentials");
  }

  if (!user.verified) {
    throw new ApiError(400, "Please verify your email before logging in");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid credentials");
  }

  const refreshToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const refreshTokenHash = await crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    {
      id: user._id,
      sessionId: session._id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("refreshToken", refreshToken, {
    ...refreshTokenCookieOptions,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Login successful", { accessToken }));
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new ApiError(401, "Unauthorised, refresh token not found");
  }
  const refreshTokenHash = await crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });
  const user = await userModel.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  if (!session) {
    throw new ApiError(400, "No session in progress");
  }
  const newAccessToken = jwt.sign(
    {
      id: decoded.id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const newRefeshToken = jwt.sign(
    {
      id: decoded.id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const newRefreshTokenHash = await crypto
    .createHash("sha256")
    .update(newRefeshToken)
    .digest("hex");
  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();
  res.cookie("refreshToken", newRefeshToken, {
    ...refreshTokenCookieOptions,
  });

  res.status(201).json(
    new ApiResponse(201, "New access token created", {
      accessToken: newAccessToken,
    }),
  );
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.clearCookie("refreshToken", clearRefreshTokenCookieOptions);
    return res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
  }

  const refreshTokenHash = await crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });
  if (!session) {
    throw new ApiError(400, "No session in progress");
  }
  session.revoked = true;
  await session.save();
  res.clearCookie("refreshToken", clearRefreshTokenCookieOptions);

  res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
});

const logoutAll = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.clearCookie("refreshToken", clearRefreshTokenCookieOptions);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Logged out from all devices"));
  }
  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
  await sessionModel.updateMany(
    {
      user: decoded.id,
      revoked: false,
    },
    {
      revoked: true,
    },
  );

  res.clearCookie("refreshToken", clearRefreshTokenCookieOptions);
  res.status(200).json(new ApiResponse(200, {}, "Logged out from all devices"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const otpDoc = await otpModel.findOne({ email }).sort({ createdAt: -1 });
  if (!otpDoc) {
    throw new ApiError(400, "OTP expired or invalid");
  }

  const isOtpValid = await bcrypt.compare(otp, otpDoc.otpHash);
  if (!isOtpValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  const user = await userModel.findByIdAndUpdate(
    otpDoc.user,
    { verified: true },
    { returnDocument: "after" },
  );
  await otpModel.deleteMany({ email });
  const refreshToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const refreshTokenHash = await crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  const accessToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("refreshToken", refreshToken, {
    ...refreshTokenCookieOptions,
  });
  return res.status(200).json(
    new ApiResponse(200, "Email verified successfully", {
      user: {
        username: user.username,
        email: user.email,
        verified: user.verified,
      },
      accessToken,
    }),
  );
});

const googleLogin = asyncHandler(async (req, res) => {
  const user = req.user;

  const refreshToken = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    {
      id: user._id,
      sessionId: session._id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("refreshToken", refreshToken, {
    ...refreshTokenCookieOptions,
  });
  return res.redirect(`${config.CLIENT_URL}/auth/success?token=${accessToken}`);

});

const getMe = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(200, "User profile retrieved", {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    }),
  );
});

export default {
  register,
  refreshToken,
  logout,
  logoutAll,
  login,
  verifyEmail,
  googleLogin,
};
