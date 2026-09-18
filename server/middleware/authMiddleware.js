/**
 * SHEMA STORE - Authentication Middleware
 */

exports.requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }
    next();
};

exports.requireAdmin = (req, res, next) => {
    if (!req.session || !req.session.adminId) {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required' 
        });
    }
    next();
};
