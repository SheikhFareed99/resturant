const register = require("../modals/registration.js");

const postregister = async (req, res) => {
    try {
        const userData = req.body; // ✅ Extract user details from request body
        const result = await register.postregister(userData);
        res.status(201).json(result); // ✅ Return success response
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { postregister };
