import jwt from 'jsonwebtoken';
import { config } from './config.js';

const getBearerToken = (headerValue) => {
  if (!headerValue || !headerValue.startsWith('Bearer ')) return null;
  return headerValue.slice('Bearer '.length);
};

export const requireAuth = (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'Missing bearer token.' });
    }

    const payload = jwt.verify(token, config.jwtSecret);
    req.auth = {
      userId: payload.user_id,
      role: payload.role,
      token,
    };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.auth || req.auth.role !== role) {
    return res.status(403).json({ message: 'Forbidden.' });
  }
  return next();
};
