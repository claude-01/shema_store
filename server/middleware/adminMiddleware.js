/**
 * SHEMA STORE - Admin Middleware
 */

exports.isAdmin = (req, res, next) => {
    if (!req.session || !req.session.adminId) {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required' 
        });
    }
    next();
};
