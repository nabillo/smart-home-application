import { query } from '../../db/index.js';

/**
 * Middleware to check if a user is a member of a specific home.
 * It also attaches the user's role within that home to the request object.
 * @param {string[]} requiredRoleNames - Optional array of role names required to proceed.
 */
export const checkHomeMembership = (requiredRoleNames = []) => {
  return async (req, res, next) => {
    const homeId = req.params.homeId;
    const userId = req.user.user_id;

    if (!homeId) {
      return res.status(400).json({ message: 'Home ID is required for this operation.' });
    }

    try {
      const membershipQuery = `
        SELECT r.role_name
        FROM homemembers hm
        JOIN roles r ON hm.role_id = r.role_id
        WHERE hm.user_id = $1 AND hm.home_id = $2
      `;
      const result = await query(membershipQuery, [userId, homeId]);

      if (result.rows.length === 0) {
        // System Admins should have access to all homes
        if (req.user.role_name === 'System Admin') {
            req.homeRole = 'System Admin';
            return next();
        }
        return res.status(403).json({ message: 'Access denied. You are not a member of this home.' });
      }

      const userRoleInHome = result.rows[0].role_name;
      req.homeRole = userRoleInHome; // Attach role in this specific home

      if (requiredRoleNames.length > 0 && !requiredRoleNames.includes(userRoleInHome)) {
        return res.status(403).json({ message: `You do not have the required role (${requiredRoleNames.join(' or ')}) in this home to perform this action.` });
      }

      next();
    } catch (error) {
      console.error('Error checking home membership:', error);
      res.status(500).json({ message: 'Internal server error during authorization.' });
    }
  };
};
