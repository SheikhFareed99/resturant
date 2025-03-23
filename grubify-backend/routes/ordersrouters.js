const express = require("express");
const { 
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
} = require("../controller/orders.js"); 

const router = express.Router();

router.post("/placeorder", placeorder);  
router.post("/feedback", feedback);  
router.post("/addorderitem", addorderitem);  
router.post("/updateorderstatus", UpdateOrderStatus);  
router.post("/generateinvoice", generateInvoice);
router.post("/reservetable", reserveTable);
router.post("/addwallettransaction", addWalletTransaction);
router.get("/customerorderhistory/:customerId", getCustomerOrderHistory);
router.post("/addingredientsupply", addIngredientSupply);
router.get("/DailySalesReport", DailySalesReport);
router.post("/addproduct", addproduct);
router.post("/updatesalary", updatesalary);
router.get("/vendoringredients", vendoringredients);
router.post("/updateloginattempts", UpdateLoginAttempts);
router.get("/productinventory", GetProductInventory);
router.get("/ingredientinventory", ingredientInventory);
router.get("/dailyOrderDetails", dailyOrderDetails);
router.get("/topsellingproducts", topSellingProducts);
router.get("/menu", getMenu);

module.exports = router;
