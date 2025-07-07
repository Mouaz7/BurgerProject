"use strict";

const mysql = require("mysql2/promise");
const config = require("../config/db/config.json");

// Skapa pool vid laddning av modulen
const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Funktion för att hämta alla burgare
async function getAllBurgers() {
    try {
        const [rows] = await pool.query("SELECT * FROM burgers");
        return rows;
    } catch (error) {
        console.error("Error fetching burgers:", error);
        throw error;
    }
}


// Funktion för att hämta ingredienser för en specifik burgare
async function getBurgerIngredients(burger_id) {
    if (!burger_id) {
        console.error("Burger ID är undefined i getBurgerIngredients");
        throw new Error("Invalid burger ID");
    }
    try {
        const [resultSets] = await pool.execute('CALL get_burger_ingredients(?)', [burger_id]);
        const ingredients = resultSets[0]; // Korrekt data finns här
        return ingredients;
    } catch (error) {
        console.error(`Error fetching ingredients for burger ID ${burger_id}:`, error);
        throw error;
    }
}

// Funktion för att skapa en anpassad burgare
async function createCustomBurger(session_id, burger_id) {
    if (!session_id || !burger_id) {
        console.error("Session ID eller Burger ID är undefined i createCustomBurger");
        throw new Error("Invalid session ID or burger ID");
    }
    try {
        const [resultSets] = await pool.execute('CALL create_custom_burger(?, ?)', [session_id, burger_id]);
        const custom_burger_id = resultSets[0][0]?.custom_burger_id;

        if (custom_burger_id === undefined) {
            console.error("Failed to retrieve custom_burger_id, result:", resultSets);
            throw new Error("Database did not return custom_burger_id");
        }

        console.log("Created custom burger ID:", custom_burger_id);
        return custom_burger_id;
    } catch (error) {
        console.error(`Error creating custom burger for session ${session_id} and burger ID ${burger_id}:`, error);
        throw error;
    }
}

// Funktion för att hämta ingredienser i en anpassad burgare
async function getCustomBurgerIngredients(custom_burger_id) {
    if (!custom_burger_id) {
        console.error("Custom Burger ID är undefined i getCustomBurgerIngredients");
        throw new Error("Invalid custom burger ID");
    }
    try {
        const [resultSets] = await pool.execute('CALL get_custom_burger_ingredients(?)', [custom_burger_id]);
        const ingredients = resultSets[0];
        return ingredients;
    } catch (error) {
        console.error(`Error fetching custom burger ingredients for ID ${custom_burger_id}:`, error);
        throw error;
    }
}


// Funktion för att modifiera mängden av en ingrediens
async function modifyCustomBurgerIngredientQuantity(custom_burger_id, ingredient_id, action) {
    if (!custom_burger_id || !ingredient_id) {
        console.error("Custom Burger ID eller Ingredient ID är undefined i modifyCustomBurgerIngredientQuantity");
        throw new Error("Invalid custom burger ID or ingredient ID");
    }
    try {
        const procedure = action === 'increase' ? 'increase_custom_burger_ingredient_quantity' : 'reduce_custom_burger_ingredient_quantity';
        await pool.execute(`CALL ${procedure}(?, ?)`, [custom_burger_id, ingredient_id]);
    } catch (error) {
        console.error(`Error modifying ingredient quantity for custom burger ID ${custom_burger_id} and ingredient ID ${ingredient_id}:`, error);
        throw error;
    }
}

// Funktion för att lägga till en ny beställning
async function addOrder(customer_id, custom_burger_id, total_price) {
    if (!customer_id || !custom_burger_id || total_price === undefined) {
        console.error("Customer ID, Custom Burger ID eller Total Price är undefined i addOrder");
        throw new Error("Invalid customer ID, custom burger ID, or total price");
    }
    try {
        await pool.execute('CALL add_order(?, ?, ?)', [customer_id, custom_burger_id, total_price]);
    } catch (error) {
        console.error(`Error adding order for customer ID ${customer_id} and burger ID ${custom_burger_id}:`, error);
        throw error;
    }
}

// Funktion för att hämta alla beställningar
async function getAllOrders() {
    try {
        const [resultSets] = await pool.execute('CALL get_all_orders()');
        const orders = resultSets[0]; // Korrekt data finns här
        return orders;
    } catch (error) {
        console.error("Error fetching all orders:", error);
        throw error;
    }
}

// Funktion för att hämta kund baserat på namn
async function getCustomerByName(name) {
    if (!name) {
        console.error("Customer name är undefined i getCustomerByName");
        throw new Error("Invalid customer name");
    }
    try {
        const [rows] = await pool.execute('SELECT * FROM customers WHERE name = ?', [name]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error(`Error fetching customer with name ${name}:`, error);
        throw error;
    }
}

// Funktion för att skapa ny kund
async function createCustomer(name) {
    if (!name) {
        console.error("Customer name är undefined i createCustomer");
        throw new Error("Invalid customer name");
    }
    try {
        const [result] = await pool.execute('INSERT INTO customers (name) VALUES (?)', [name]);
        const insertId = result.insertId;
        return insertId;
    } catch (error) {
        console.error(`Error creating customer with name ${name}:`, error);
        throw error;
    }
}

// Funktion för att hantera en beställning
async function handleOrder(customerName, customBurgerID, totalPrice) {
    if (!customerName || !customBurgerID || totalPrice === undefined) {
        console.error("Customer name, Custom Burger ID eller Total Price är undefined i handleOrder");
        throw new Error("Invalid customer name, custom burger ID, or total price");
    }
    try {
        let customer = await getCustomerByName(customerName);
        if (!customer) {
            const customerID = await createCustomer(customerName);
            customer = { customer_id: customerID };
        }
        await addOrder(customer.customer_id, customBurgerID, totalPrice);
    } catch (error) {
        console.error(`Error handling order for customer ${customerName}:`, error);
        throw error;
    }
}

// Funktion för att slutföra en beställning
async function finishOrder(orderID) {
    if (!orderID) {
        console.error("Order ID är undefined i finishOrder");
        throw new Error("Invalid order ID");
    }
    try {
        await pool.execute('CALL complete_order(?)', [orderID]);
        console.log(`Order with ID ${orderID} marked as completed.`);
    } catch (error) {
        console.error(`Error completing order with ID ${orderID}:`, error);
        throw error;
    }
}

// Funktion för att hämta finaliserade beställningar
async function getFinalizedOrders() {
    try {
        const [resultSets] = await pool.execute('CALL get_finalized_orders()');
        const orders = resultSets[0]; // Korrekt data finns här
        return orders;
    } catch (error) {
        console.error("Error fetching finalized orders:", error);
        throw error;
    }
}

// Funktion för att radera en beställning
async function deleteOrder(orderID) {
    if (!orderID) {
        console.error("Order ID är undefined i deleteOrder");
        throw new Error("Invalid order ID");
    }
    try {
        await pool.execute('CALL delete_order(?)', [orderID]);
        console.log(`Order with ID ${orderID} has been deleted.`);
    } catch (error) {
        console.error(`Error deleting order with ID ${orderID}:`, error);
        throw error;
    }
}

// Exportera alla funktioner
module.exports = {
    getAllBurgers,
    getBurgerIngredients,
    createCustomBurger,
    getCustomBurgerIngredients,
    modifyCustomBurgerIngredientQuantity,
    addOrder,
    getAllOrders,
    getCustomerByName,
    createCustomer,
    handleOrder,
    finishOrder,
    getFinalizedOrders,
    deleteOrder
};
