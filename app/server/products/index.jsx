import fs from 'fs';
import express from 'express';
const router = express.Router({ mergeParams: true });

router.post('/cart/update', function *(req, res) {
    fs.writeFile('./app/server/fake-database-cart.js', `var cart = ${JSON.stringify(req.body.cart)};\n\nexport default cart;`, () => {
        console.log('Cart updated!');
    });
    res.send('Cart Updated!');
});

export default router;
