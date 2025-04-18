const { sql, poolPromise } = require("../db.js");

const User = {


    async getAllIngredientNames() {
        try {
            const pool = await poolPromise;
            
            const result = await pool.request()
                .execute("GetAllIngredientNames"); // Assuming you'll create this stored procedure
            
            return result.recordset;
        } catch (error) {
            console.error("Database query failed:", error);
            throw new Error("Failed to fetch ingredient names");
        }
    },


    async updateIngredients(orderData) {
        try {
            const pool = await poolPromise;
            const { order, customer_id,order_type ,PaymentMethod} = orderData;
      
            console.log("customer_id:", customer_id);
            const customer_idd= parseInt(customer_id);
           console.log(typeof customer_idd);
            if (!Number.isInteger(customer_idd) || customer_idd <= 0) {
                throw new Error(`Invalid customer_id: ${customer_idd}`);
            }
    
            // Insert new order and get OrderID
            const orderResult = await pool.request()
                .input("CustomerID", sql.Int, customer_idd)
                .input("OrderType", sql.VarChar,order_type)
                .input("OrderDate", sql.DateTime, new Date())
                .input("OrderStatus", sql.VarChar, "Pending")
                .input("Rating", sql.Int, null)
                .input("Feedback", sql.VarChar, null)
                .query(`
                    INSERT INTO [Orders] (CustomerID, OrderType, OrderDate, OrderStatus, Rating, Feedback)
                    OUTPUT INSERTED.OrderID
                    VALUES (@CustomerID, @OrderType, @OrderDate, @OrderStatus, @Rating, @Feedback)
                `);
    
            const OrderID = orderResult.recordset[0].OrderID;
            console.log("Generated OrderID:", OrderID);
    
            if (!Number.isInteger(OrderID) || OrderID <= 0) {
                throw new Error(`Invalid OrderID: ${OrderID}`);
            }
    
            if (!Array.isArray(order) || order.length === 0) {
                throw new Error("order must be a non-empty array");
            }
            let TotalAmount=99;
    
            for (const item of order) {
                const { item_id, quantity ,current_price} = item;
                TotalAmount+=current_price*quantity;
                if (!Number.isInteger(item_id) || item_id <= 0) {
                    throw new Error(`Invalid item_id: ${item_id}`);
                }
                if (!Number.isInteger(quantity) || quantity <= 0) {
                    throw new Error(`Invalid quantity for item_id ${item_id}: ${quantity}`);
                }
    
                await pool.request()
                    .input("OrderID", sql.Int, OrderID)
                    .input("productid", sql.Int, item_id)
                    .input("orderquantity", sql.Int, quantity)
                    .input("current_price", sql.Int, current_price)
                    .execute("UpdateInventoryOnOrder");
            }

               let Tax = 16;
               if(PaymentMethod==="card"){
                Tax = 5;
            }

            if (order_type.toLowerCase() === "dine-in") {
                TotalAmount-=99;
                const tableRes = await pool.request()
                    .input("OrderID", sql.Int, OrderID)
                    .execute("sp_ReserveAvailableTable");
            
                const reservationResult = tableRes.recordset[0];
            
                if (!reservationResult || reservationResult.Message !== 'Table reserved successfully') {
                    throw new Error("Table reservation failed after placing order.");
                }
            
                console.log("Reserved Table ID:", reservationResult.TableID);
            }
            
            const invoiceResult = await pool.request()
    .input("OrderID", sql.Int, OrderID)
    .input("TotalAmount", sql.Int, TotalAmount)
    .input("Tax", sql.Int, Tax) 
    .input("DiscountApplied", sql.Int, 0) 
    .input("PaidStatus", sql.VarChar, "paid")
    .input("PaymentMethod", sql.VarChar, PaymentMethod)
    .execute("GenerateInvoice");

const invoiceID = invoiceResult.recordset[0].NewInvoiceID;
console.log("Invoice created with ID:", invoiceID);
    
            return { message: "Order placed and ingredients updated  successfully", OrderID };
        } catch (error) {
            console.error("Database query failed:", error);
            if (error.message.includes("Insufficient stock")) {
                throw new Error("Insufficient stock for one or more ingredients");
            }
            if (error.message.includes("CHECK constraint")) {
                throw new Error("Update failed due to insufficient ingredient stock");
            }
            throw new Error(`Failed to update ingredients: ${error.message}`);
        }
    },
    async  placeorder(userData) {
        try {
            const pool = await poolPromise;
    
            const result = await pool.request()
                .input("customer_id", sql.Int, userData.customer_id)
                .input("OrderType", sql.VarChar,  userData.OrderType) 
                .input("OrderStatus", sql.VarChar,  userData.OrderStatus)
                .execute("sp_PlaceOrder");
         return { message: "order placed successfully", result: result.recordset };
        } catch (error) {
            console.error("Database query failed:", error);
            throw new Error(" failed");
        }
    },

    async  feedback(userData) {
        try {
            const pool = await poolPromise;
    
            const result = await pool.request()
                .input("OrderID", sql.Int, userData.OrderID)
                .input("UserID", sql.Int,  userData.UserID) 
                .input("Rating", sql.Int,  userData.Rating)
                .input("Feedback", sql.Text,  userData.Feedback)
                .execute("UpdateOrderFeedback");
         return { message: "feedback placed successfully", result: result.recordset };
        } catch (error) {
            console.error("Database query failed:", error);
            throw new Error(" failed");
        }
    },

    async  addorderitem(userData) {
        try {
            const pool = await poolPromise;
    
            const result = await pool.request()
                .input("OrderID", sql.Int, userData.OrderID)
                .input("ProductID", sql.Int,  userData.ProductID) 
                .input("Quantity", sql.Int,  userData.Quantity)
                .input("TotalPrice", sql.Int,  userData.TotalPrice)
                .execute("AddOrderItem");
         return { message: "order items added   successfully", result: result.recordset };
        } catch (error) {
            console.error("Database query failed:", error);
            throw new Error(" failed");
        }
    },
    async  UpdateOrderStatus(userData) {
        try {
            const pool = await poolPromise;
    
            const result = await pool.request()
                .input("OrderID", sql.Int, userData.OrderID)
                .input("NewStatus", sql.VarChar,  userData.NewStatus) 

                .execute("UpdateOrderStatus");
         return { message: "update order status   successfully", result: result.recordset };
        } catch (error) {
            console.error("Database query failed:", error);
            throw new Error(" failed");
        }
    },
  
        // 1. Generate Invoice
        async generateInvoice(userData) {
            try {
                const pool = await poolPromise;
                const result = await pool.request()
                    .input("OrderID", sql.Int, userData.OrderID)
                    .input("TotalAmount", sql.Int, userData.TotalAmount)
                    .input("Tax", sql.Int, userData.Tax || 16)
                    .input("DiscountApplied", sql.Int, userData.DiscountApplied || 0)
                    .input("PaidStatus", sql.VarChar, userData.PaidStatus)
                    .input("PaymentMethod", sql.VarChar, userData.PaymentMethod)
                    .execute("GenerateInvoice");
    
                return { message: "Invoice generated successfully", InvoiceID: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Invoice generation failed");
            }
        },
    
        // 2. Reserve Table
        async reserveTable(userData) {
            try {
                const pool = await poolPromise;
                const result = await pool.request()
                    .input("OrderID", sql.Int, userData.OrderID)
                    .input("TableID", sql.Int, userData.TableID)
                    .input("ReservationTime", sql.DateTime, userData.ReservationTime)
                    .execute("ReserveTable");
    
                return { message: "Table reserved successfully", ReservationID: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Table reservation failed");
            }
        },
    
        // 3. Wallet Transaction
        async addWalletTransaction(userData) {
            try {
                const pool = await poolPromise;
                const result = await pool.request()
                    .input("customer_id", sql.Int, userData.customer_id)
                    .input("TransactionType", sql.VarChar, userData.TransactionType)
                    .input("Amount", sql.Int, userData.Amount)
                    .input("OrderID", sql.Int, userData.OrderID || null)
                    .execute("AddWalletTransaction");
    
                return { message: "Wallet transaction successful", TransactionID: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Wallet transaction failed");
            }
        },
    
        // 4. Get Customer Order History
        async getCustomerOrderHistory(userData) {
            try {
                console.log("Received customer_id:", userData.customer_id); // Now lowercase
                const pool = await poolPromise;
                const result = await pool.request()
                    .input("customer_id", sql.Int, userData.customer_id) // Use lowercase
                    .execute("GetCustomerOrderHistory");
                return { message: "Order history retrieved successfully", Orders: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to fetch order history");
            }
        },async getCustomerOrderHistory(userData) {
            try {
          
                if (!userData.customer_id || isNaN(userData.customer_id)) {
                    throw new Error("Invalid customer_id provided");
                }
        
                const pool = await poolPromise;
                const request = pool.request();
                
                request.input("CustomerID", sql.Int, userData.customer_id);
        
                const result = await request.execute("GetCustomerOrderHistory");
        
        
                return { 
                    message: "Order history retrieved successfully",
                    Orders: result.recordset 
                };
            } catch (error) {
                console.error("Model Error:", {
                    error: error.message,
                    stack: error.stack
                });
                throw new Error(`Database operation failed: ${error.message}`);
            }
        },
        // 5. Add Ingredient Supply Record
        async addIngredientSupply(userData) {
            try {
                const pool = await poolPromise;
                const result = await pool.request()
                    .input("IngredientID", sql.Int, userData.IngredientID)
                    .input("VendorID", sql.Int, userData.VendorID)
                    .input("PurchaseDate", sql.Date, userData.PurchaseDate)
                    .input("PurchaseAmount", sql.Int, userData.PurchaseAmount)
                    .input("PurchaseRate", sql.Int, userData.PurchaseRate)
                    .execute("AddIngredientSupply");
    
                return { message: "Ingredient supply record added successfully" };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to add ingredient supply record");
            }
        },
    
        // 6. Get Daily Sales Report
        async DailySalesReport(userData) {
            try {
                const pool = await poolPromise;
                const result = await pool.request()
                    .input("OrderDate", sql.Date, userData.OrderDate)
                    .query("SELECT * FROM DailySalesReport WHERE OrderDate = @OrderDate");
    
                return { message: "Daily sales report retrieved successfully", Report: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to fetch daily sales report");
            }
        },

        async addproduct(userData) {
            try {
                const pool = await poolPromise;
                console.log(userData);
                const result = await pool.request()
                    .input("ItemDescription", sql.VarChar(500), userData.ItemDescription)
                    .input("Quantity", sql.Int, userData.Quantity)
                    .input("Image", sql.VarChar(200), userData.Image)
                    .input("ItemName", sql.VarChar(255), userData.ItemName)
                    .input("Category", sql.VarChar(255), userData.Category)
                    .input("SpiceLevel", sql.VarChar(255), userData.SpiceLevel)
                    .input("CookingTime", sql.Int, userData.CookingTime)
                    .input("CurrentPrice", sql.Int, userData.CurrentPrice)
                    .input("AvailabilityStatus", sql.Int, userData.AvailabilityStatus || 0)
                    .execute("AddNewProduct");
    
                return { message: "Product added successfully", result: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to add new product");
            }
        },
        async addRecipeItems(productID, recipeItems) {
            try {
                const pool = await poolPromise;
        
                for (const item of recipeItems) {
                    const { IngredientID, Quantity } = item;
            
                    await pool.request()
                        .input("ProductID", sql.Int, productID)
                        .input("IngredientID", sql.Int, IngredientID)
                        .input("Quantity", sql.Int, Quantity)
                        .query(`
                            INSERT INTO Recipes (ProductID, IngredientID, Quantity)
                            VALUES (@ProductID, @IngredientID, @Quantity)
                        `);
                }
        
                return { message: "Recipe added successfully for product ID: " + productID };
            } catch (error) {
                console.error("Database query failed while adding recipe:", error);
                throw new Error("Failed to add recipe");
            }
        },
        
        async updatesalary(userData) {
            try {
                const pool = await poolPromise;
                await pool.request()
                    .input("EmployeeID", sql.Int, userData.EmployeeID)
                    .input("NewSalary", sql.Int, userData.NewSalary)
                    .execute("UpdateEmployeeSalary");
    
                return { message: "Salary updated successfully" };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to update salary");
            }
        },
    

        async vendoringredients(userData) {
            try {
                const pool = await poolPromise;
                const result = await pool.request()
                    .input("VendorID", sql.Int, userData.VendorID)
                    .execute("GetVendorIngredients");
    
                return { message: "Vendor ingredients retrieved successfully", Ingredients: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to fetch vendor ingredients");
            }
        },
   
        async UpdateLoginAttempts(userData) {
            try {
                const pool = await poolPromise;
                await pool.request()
                    .input("Email", sql.VarChar(255), userData.Email)
                    .input("NewAttempts", sql.Int, userData.NewAttempts)
                    .execute("UpdateLoginAttempts");
    
                return { message: "Login attempts updated successfully" };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to update login attempts");
            }
        },
    
        async GetProductInventory() {
            try {
                const pool = await poolPromise;
                const result = await pool.request().query("SELECT * FROM ProductInventory");
    
                return { message: "Product inventory retrieved successfully", Inventory: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to fetch product inventory");
            }
        },
    
        
        async ingredientInventory() {
            try {
                const pool = await poolPromise;
                const result = await pool.request().query("SELECT * FROM IngredientInventory");
    
                return { message: "Ingredient inventory retrieved successfully", Inventory: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to fetch ingredient inventory");
            }
        },
    
        async dailyOrderDetails(userData) {
            try {
                if (!userData || !userData.OrderDate) {
                    throw new Error("Invalid input: OrderDate is required");
                }
        
                console.log("Received OrderDate:", userData.OrderDate);  // Debugging log
        
                const pool = await poolPromise;
                const result = await pool.request()
                    .input("OrderDate", sql.Date, userData.OrderDate)  // Use sql.Date
                    .query("SELECT * FROM DailyOrderDetails WHERE OrderDate >= @OrderDate AND OrderDate < DATEADD(DAY, 1, @OrderDate)");
        
                return { message: "Daily order details retrieved successfully", Orders: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to fetch daily order details");
            }
        },
        
        
    
        async topSellingProducts() {
            try {
                const pool = await poolPromise;
                const result = await pool.request().query("SELECT * FROM TopSellingProducts");
    
                return { message: "Top selling products retrieved successfully", Products: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to fetch top-selling products");
            }
        },

        async getMenu() {
            try {
                const pool = await poolPromise;
                const result = await pool.request().query("SELECT * FROM Menu");
    
                return { message: "Menu retrieved successfully", Menu: result.recordset };
            } catch (error) {
                console.error("Database query failed:", error);
                throw new Error("Failed to fetch menu");
            }
        },
        
         // Add Employee
    async addemployee(employeeData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input("Email", employeeData.Email)
                .input("Password", employeeData.Password)
                .input("FName", employeeData.FName)
                .input("LName", employeeData.LName)
                .input("DOB", employeeData.DOB)
                .input("Gender", employeeData.Gender)
                .input("PhoneNo", employeeData.PhoneNo)
                .input("Address", employeeData.Address)
                .input("CNIC", employeeData.CNIC)
                .input("Salary", employeeData.Salary)
                .input("BankAccount", employeeData.BankAccount)
                .input("ManagerID", employeeData.ManagerID || null)
                .execute("sp_AddEmployee");

            return { message: "Employee added successfully", result };
        } catch (error) {
            console.error("Database query failed:", error);
            throw new Error("Failed to add employee");
        }
    },

    // Add Menu Item
    async addmenuitem(menuData) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input("item_name", menuData.item_name)
                .input("Category", menuData.Category)
                .input("SpiceLevel", menuData.SpiceLevel)
                .input("CookingTime", menuData.CookingTime)
                .input("current_price", menuData.current_price)
                .input("AvailablityStatus", menuData.AvailablityStatus)
                .input("item_description", menuData.item_description)
                .input("image", menuData.image)
                .input("quantity", menuData.quantity)
                .execute("sp_AddMenuItem");

            return { message: "Menu item added successfully", result };
        } catch (error) {
            console.error("Database query failed:", error);
            throw new Error("Failed to add menu item");
        }
    },

    // Remove Menu Item
    async removeMenuItem(ProductID) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input("ProductID", ProductID)
                .execute("sp_RemoveMenuItem");

            return { message: "Menu item removed successfully" };
        } catch (error) {
            console.error("Database query failed:", error);
            throw new Error("Failed to remove menu item");
        }
    },

    // Add Table
    async addtable(Capacity, IsAvailable = 1) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input("Capacity", Capacity)
                .input("IsAvailable", IsAvailable)
                .execute("sp_AddTable");

            return { message: "Table added successfully" };
        } catch (error) {
            console.error("Database query failed:", error);
            throw new Error("Failed to add table");
        }
    },

    // Remove Table
    async removeTable(TableID) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input("TableID", TableID)
                .execute("sp_RemoveTable");

            return { message: "Table removed successfully" };
        } catch (error) {
            console.error("Database query failed:", error);
            throw new Error("Failed to remove table");
        }
    },

    // Update Table Capacity
    async updateTableCapacity(TableID, NewCapacity) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input("TableID", TableID)
                .input("NewCapacity", NewCapacity)
                .execute("sp_UpdateTableCapacity");

            return { message: "Table capacity updated successfully" };
        } catch (error) {
            console.error("Database query failed:", error);
            throw new Error("Failed to update table capacity");
        }
    },



    async deductMoneyToWallet(customer_id, Amount) {
        try {
            console.log("customer_id:", customer_id);
            console.log(typeof customer_id);
            if (!Amount || isNaN(Amount) || Amount <= 0) {
                throw new Error('Amount must be a valid positive number');
            }
    
            const pool = await poolPromise;
            const result = await pool.request()
                .input('CustomerID', sql.Int, customer_id)
                .input('Amount', sql.Decimal(18, 2), parseFloat(Amount))
                .execute('sp_DeductFromWallet');
    
            const operationResult = result.recordset[0];
    
            if (!operationResult.Success) {
                throw new Error(operationResult.Message);
            }
    
            return operationResult;
        } catch (error) {
            console.error('Deduction Error:', error);
            throw error;
        }
    },
    async addMoneyToWallet(customer_id, Amount) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            
           
            const result = await request
                .input('CustomerID', sql.Int, customer_id)
                .input('Amount', sql.Decimal(18, 2), Amount)
                .execute('sp_AddMoneyToWallet');
            
           
            const returnValue = result.returnValue;
            
            if (returnValue === -1) {
                throw new Error('Customer does not exist');
            }
            
            return { message: 'Money added successfully' };
        } catch (error) {
            console.error('Database Error:', error);
            throw error;
        }
    },
    async checkIfTableAvailable() {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            const result = await request.query(`
                SELECT TOP 1 TableID 
                FROM Tables 
                WHERE IsAvailable = 1
            `);
            if (result.recordset.length > 0) {
                return { available: true, tableID: result.recordset[0].TableID };
            } else {
                return { available: false };
            }
        } catch (error) {
            console.error('Database Error:', error);
            throw error;
        }
    }

    
};


module.exports = User;
