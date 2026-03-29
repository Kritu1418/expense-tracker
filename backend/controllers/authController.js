const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { errorResponse, successResponse } = require("../utils/errorResponse");

const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, errors.array()[0].msg);
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "Email already registered");
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    return successResponse(
      res,
      201,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          monthlyBudget: user.monthlyBudget,
          currency: user.currency,
          darkMode: user.darkMode,
          customCategories: user.customCategories,
        },
      },
      "Account created successfully"
    );
  } catch (err) {
    console.error("SIGNUP ERROR:", err.stack);
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, errors.array()[0].msg);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    const token = generateToken(user._id);

    return successResponse(
      res,
      200,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          monthlyBudget: user.monthlyBudget,
          currency: user.currency,
          darkMode: user.darkMode,
          customCategories: user.customCategories,
        },
      },
      "Login successful"
    );
  } catch (err) {
    console.error("LOGIN ERROR:", err.stack);
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 200, user, "Profile fetched");
  } catch (err) {
    console.error("PROFILE ERROR:", err.stack);
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, currency, darkMode, monthlyBudget, customCategories } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, currency, darkMode, monthlyBudget, customCategories },
      { new: true, runValidators: true }
    );

    return successResponse(res, 200, user, "Profile updated");
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err.stack);
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return errorResponse(res, 400, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, null, "Password changed successfully");
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err.stack);
    return errorResponse(res, 500, "Server error: " + err.message);
  }
};

module.exports = { signup, login, getProfile, updateProfile, changePassword };