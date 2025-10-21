import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { query } from '../../db/index.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'You are not logged in. Please log in to get access.' });
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Fetch user, their role, and all permissions associated with that role
    const userQuery = `
      SELECT 
        u.user_id, 
        u.username, 
        u.email, 
        r.role_name,
        COALESCE(ARRAY_AGG(p.permission_name) FILTER (WHERE p.permission_name IS NOT NULL), '{}') AS permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, r.role_name
    `;
    const userResult = await query(userQuery, [decoded.id]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'The user belonging to this token does no longer exist.' });
    }

    // Attach user and their permissions to the request object
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

/**
 * Middleware to restrict access to routes based on user permissions.
 * @param {...string} requiredPermissions - The permissions required to access the route.
 */
export const restrictTo = (...requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    
    // Check if the user has all of the required permissions
    const hasRequiredPermissions = requiredPermissions.every(perm => userPermissions.includes(perm));

    if (!hasRequiredPermissions) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
};
