import jwt from "jsonwebtoken";

// Token validation middleware
export const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      (req.headers.authorization
        ? req.headers.authorization.replace("Bearer ", "")
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication failed, please try again",
    });
  }
};

//token validation for organization
export const organizationAuth = async (req, res, next) => {
  try {
    // Get the organization token from cookies, body, or authorization header
    const token =
      req.cookies.organization_token ||
      req.body.organization_token ||
      (req.headers.authorization
        ? req.headers.authorization.replace("Bearer ", "")
        : null);

    // Check if the token is provided
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Organization token is missing",
      });
    }

    // Verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET); // Use the secret for verifying the organization token
      req.organization = decode;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Organization token has expired",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid organization token",
      });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication failed, please try again",
    });
  }
};

// Role validation for Student
export const isStudent = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// Role validation for Alumni
export const isAlumni = async (req, res, next) => {
  try {
    if (req.user.role !== "alumni") {
      // Fixed typo from req.usesr to req.user
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// Role validation for Faculty
export const isFaculty = async (req, res, next) => {
  try {
    if (req.user.role !== "faculty") {
      // Fixed typo from req.usesr to req.user
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// is Faculty or alumni
export const isAlumniOrFaculty = (req, res, next) => {
  try {
    if (req.user.role === "alumni" || req.user.role === "faculty") {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Access denied. You must be an alumni or faculty." });
    }
  } catch (error) {
    console.error("Error in isAlumniOrFaculty middleware:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      // Fixed typo from req.usesr to req.user
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};
