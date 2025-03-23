const User = require("../modals/user.modal.js");



const loginUser = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.loginUser(userData);  
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {  loginUser }; 
