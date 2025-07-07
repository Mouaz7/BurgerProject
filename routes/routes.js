const express = require('express');
const router = express.Router();
const src = require('../src/src');

// Startsida
router.get('/', (req, res) => {
    res.render('pages/welcome', { title: 'Welcome to Our Burger Project' });
});

// Visa alla tillgängliga burgare
router.get('/orders', async (req, res) => {
    try {
        const burgers = await src.getAllBurgers();
        res.render('pages/orders', { burgers, title: 'Available Burgers', csrfToken: req.csrfToken() });
    } catch (error) {
        console.error("Failed to fetch burgers:", error);
        res.status(500).send("Error fetching burgers.");
    }
});

// Visa beställningshistorik
router.get('/orders/history', async (req, res) => {
    try {
        const orders = await src.getAllOrders();
        res.render('pages/orderHistory', { orders, title: 'Order History', csrfToken: req.csrfToken() });
    } catch (error) {
        console.error("Failed to fetch order history:", error);
        res.status(500).send("Error fetching order history.");
    }
});

// Radera en beställning
router.post('/orders/delete/:orderID', async (req, res) => {
    const orderID = parseInt(req.params.orderID, 10);

    if (isNaN(orderID)) {
        return res.status(400).send("Invalid order ID.");
    }

    try {
        await src.deleteOrder(orderID);
        res.redirect('/orders/history');
    } catch (error) {
        console.error(`Failed to delete order with ID ${orderID}:`, error);
        res.status(500).send("Error deleting order.");
    }
});

// Visa finaliserade beställningar
router.get('/kitchen', async (req, res) => {
    try {
        const finalizedOrders = await src.getFinalizedOrders();
        res.render('pages/kitchen', { finalizedOrders, title: 'Finalized Orders', csrfToken: req.csrfToken() });
    } catch (error) {
        console.error("Failed to fetch finalized orders:", error);
        res.status(500).send("Error fetching finalized orders.");
    }
});

// Markera en beställning som slutförd
router.post('/kitchen/complete/:orderID', async (req, res) => {
    const orderID = parseInt(req.params.orderID, 10);

    if (isNaN(orderID)) {
        return res.status(400).send("Invalid order ID.");
    }

    try {
        await src.finishOrder(orderID);
        res.redirect('/kitchen');
    } catch (error) {
        console.error(`Failed to complete order with ID ${orderID}:`, error);
        res.status(500).send("Error completing order.");
    }
});

// Visa ingredienser för en specifik burgare
router.get('/orders/:id', async (req, res) => {
    const burgerID = parseInt(req.params.id, 10);
    if (isNaN(burgerID)) {
        return res.status(400).send("Invalid burger ID.");
    }

    try {
        const ingredients = await src.getBurgerIngredients(burgerID);
        res.render('pages/burgerDetails', { burgerID, ingredients, title: `Burger Details - ${burgerID}`, csrfToken: req.csrfToken() });
    } catch (error) {
        console.error(`Failed to fetch ingredients for burger ${burgerID}:`, error);
        res.status(500).send("Error fetching burger ingredients.");
    }
});

// Skapa en anpassad burgare baserat på en specifik burgare
router.post('/orders/:id/select', async (req, res) => {
    const sessionID = req.session ? req.session.id : null;
    const burgerID = parseInt(req.params.id, 10);

    if (!sessionID || isNaN(burgerID)) {
        return res.status(400).send("Session ID or Burger ID is invalid.");
    }

    try {
        const customBurgerID = await src.createCustomBurger(sessionID, burgerID);
        if (!customBurgerID) throw new Error("Custom burger ID is undefined");

        res.redirect(`/orders/custom/${customBurgerID}`);
    } catch (error) {
        console.error(`Failed to create custom burger with ID ${burgerID}:`, error);
        res.status(500).send("Error creating custom burger.");
    }
});

// Visa detaljer för en anpassad burgare
router.get('/orders/custom/:id', async (req, res) => {
    const customBurgerID = parseInt(req.params.id, 10);
    if (isNaN(customBurgerID)) {
        return res.status(400).send("Invalid custom burger ID.");
    }

    try {
        const ingredients = await src.getCustomBurgerIngredients(customBurgerID);
        const totalPrice = ingredients.reduce((sum, ingredient) => {
            const price = parseFloat(ingredient.ingredient_price) || 0; // Ändrat till 'ingredient_price'
            const quantity = parseInt(ingredient.quantity, 10) || 0;
            return sum + (price * quantity);
        }, 0);
        res.render('pages/customBurgerDetails', { 
            customBurgerID,
            ingredients,
            totalPrice,
            title: `Customize Your Burger`,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error(`Failed to fetch custom burger ingredients for burger ID ${customBurgerID}:`, error);
        res.status(500).send("Error fetching custom burger ingredients.");
    }
});

// Minska mängden av en ingrediens i en anpassad burgare
router.post('/orders/custom/:id/remove/:ingredientID', async (req, res) => {
    const customBurgerID = parseInt(req.params.id, 10);
    const ingredientID = parseInt(req.params.ingredientID, 10);

    if (isNaN(customBurgerID) || isNaN(ingredientID)) {
        return res.status(400).send("Invalid burger ID or ingredient ID.");
    }

    try {
        await src.modifyCustomBurgerIngredientQuantity(customBurgerID, ingredientID, 'decrease');
        res.redirect(`/orders/custom/${customBurgerID}`);
    } catch (error) {
        console.error(`Failed to remove ingredient ${ingredientID} from custom burger ${customBurgerID}:`, error);
        res.status(500).send("Error modifying ingredient quantity.");
    }
});

// Öka mängden av en ingrediens i en anpassad burgare
router.post('/orders/custom/:id/increase/:ingredientID', async (req, res) => {
    const customBurgerID = parseInt(req.params.id, 10);
    const ingredientID = parseInt(req.params.ingredientID, 10);

    if (isNaN(customBurgerID) || isNaN(ingredientID)) {
        return res.status(400).send("Invalid burger ID or ingredient ID.");
    }

    try {
        await src.modifyCustomBurgerIngredientQuantity(customBurgerID, ingredientID, 'increase');
        res.redirect(`/orders/custom/${customBurgerID}`);
    } catch (error) {
        console.error(`Failed to add ingredient ${ingredientID} to custom burger ${customBurgerID}:`, error);
        res.status(500).send("Error modifying ingredient quantity.");
    }
});

// Slutför en beställning
router.post('/orders/custom/:id/complete', async (req, res) => {
    const customerName = req.body.customerName; 
    const customBurgerID = parseInt(req.params.id, 10);
    const totalPrice = parseFloat(req.body.totalPrice);

    if (!customerName || isNaN(customBurgerID) || isNaN(totalPrice)) {
        return res.status(400).send("Invalid order data.");
    }

    try {
        await src.handleOrder(customerName, customBurgerID, totalPrice);
        res.redirect('/kitchen');
    } catch (error) {
        console.error(`Failed to complete order for customer ${customerName}:`, error);
        res.status(500).send("Error completing order.");
    }
});

module.exports = router;
