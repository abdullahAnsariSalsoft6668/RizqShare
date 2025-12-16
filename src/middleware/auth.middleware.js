const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyFirebaseToken } = require('../config/firebase');

/**
 * Middleware to protect routes - supports both Firebase and JWT authentication
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. Please provide a valid token.'
      });
    }

    try {
      // Try Firebase verification first
      const decodedToken = await verifyFirebaseToken(token);
      
      // Find user by Firebase UID
      let user = await User.findOne({ firebaseUid: decodedToken.uid });
      
      // If user doesn't exist, create one (first-time Firebase user)
      if (!user) {
        user = await User.create({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email,
          fullName: decodedToken.name || decodedToken.email.split('@')[0],
          profilePicture: decodedToken.picture || ''
        });
      }
      
      req.user = user;
      req.userId = user._id;
      next();
      
    } catch (firebaseError) {
      // If Firebase fails, try JWT verification
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id);
        
        if (!user || !user.isActive) {
          return res.status(401).json({
            status: 'error',
            message: 'User no longer exists or is inactive.'
          });
        }
        
        req.user = user;
        req.userId = user._id;
        next();
        
      } catch (jwtError) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid or expired token. Please login again.'
        });
      }
    }
    
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed.',
      error: error.message
    });
  }
};

/**
 * Middleware to restrict access to specific subscription tiers
 */
const restrictTo = (...tiers) => {
  return (req, res, next) => {
    if (!tiers.includes(req.user.subscriptionTier)) {
      return res.status(403).json({
        status: 'error',
        message: 'This feature requires a Pro subscription.',
        requiredTier: tiers
      });
    }
    next();
  };
};

/**
 * Optional authentication - sets user if token is valid, but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
          req.user = user;
          req.userId = user._id;
        }
      } catch (error) {
        // Silently fail - user will be undefined
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  restrictTo,
  optionalAuth
};

