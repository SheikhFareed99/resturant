const User = require("../modals/orders.js");

// 1. Place Order
const placeorder = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.placeorder(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Submit Feedback
const feedback = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.feedback(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Add Order Item
const addorderitem = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.addorderitem(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Update Order Status
const UpdateOrderStatus = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.UpdateOrderStatus(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Generate Invoice
const generateInvoice = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.generateInvoice(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Reserve a Table
const reserveTable = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.reserveTable(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. Add Wallet Transaction
const addWalletTransaction = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.addWalletTransaction(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. Get Customer Order History
const getCustomerOrderHistory = async (req, res) => {
    try {
        const { customerId } = req.params;
        const result = await User.getCustomerOrderHistory({ customerId });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 9. Add Ingredient Supply
const addIngredientSupply = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.addIngredientSupply(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 10. Get Daily Sales Report
const DailySalesReport = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.DailySalesReport(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 11. Add New Product
const addproduct = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.addproduct(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 12. Update Employee Salary
const updatesalary = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.updatesalary(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 13. Get Vendor Ingredients
const vendoringredients = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.vendoringredients(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 14. Update Login Attempts
const UpdateLoginAttempts = async (req, res) => {
    try {
        const userData = req.body;
        const result = await User.UpdateLoginAttempts(userData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 15. Get Product Inventory Status
const GetProductInventory = async (req, res) => {
    try {
        const result = await User.GetProductInventory();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 16. Get Ingredient Inventory Status
const ingredientInventory = async (req, res) => {
    try {
        const result = await User.ingredientInventory();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 17. Get Daily Order Details
const dailyOrderDetails = async (req, res) => {
    try {
        const result = await User.dailyOrderDetails();
        res.status(200).json(result);
        console.log("Request Body:", req.body);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 18. Get Top Selling Products
const topSellingProducts = async (req, res) => {
    try {
        const result = await User.topSellingProducts();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 19. Get Menu
const getMenu = async (req, res) => {
    try {
        const result = await User.getMenu();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    placeorder,
    feedback,
    addorderitem,
    UpdateOrderStatus,
    generateInvoice,
    reserveTable,
    addWalletTransaction,
    getCustomerOrderHistory,
    addIngredientSupply,
    DailySalesReport,
    addproduct,
    updatesalary,
    vendoringredients,
    UpdateLoginAttempts,
    GetProductInventory,
    ingredientInventory,
    dailyOrderDetails,
    topSellingProducts,
    getMenu
};
