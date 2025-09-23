const isAdmin = (req, res, next) => {
    console.log('Checking for Admin role...'); // Debugging line
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication failed: User role not found.' });
    };

    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied: You do not have administrator privileges.' });
    }
    console.log('Admin access granted.');
    next();


};
module.exports = { isAdmin }