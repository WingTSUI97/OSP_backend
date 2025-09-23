const isAdmin = (req, res, next) =>{
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({message: 'Authentication failed: User role not found.'});
        };

        if (req.user.role !== 'Admin') {
            return res.status(403).json({message: 'Access denied: You do not have administrator privileges.'});
        }

        next();
    }
};
module.exports = {isAdmin}