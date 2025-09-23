const authMiddleware = (req, res, next) => {
    // get the API key from headers
    const apiKey = req.headers['x-api-key'];

    // check if the API key is valid
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        return res
            .status(401)
            .json({ message: 'Unauthorized: Invalid or missing API Key' });
    }
    // attach the admin role to the request object
    req.user = { role: 'Admin' };

    console.log('API key validated, user role set to Admin');
    // pass control to the next middleware or route handler
    next();

};

module.exports = authMiddleware;