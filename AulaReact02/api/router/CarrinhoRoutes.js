const router = require("express").Router();
const CarrinhoController = require("../controller/CarrinhoController.js");

router.post('/create', CarrinhoController.create);
router.get('/getById/:id', CarrinhoController.getById);
router.post('/addItem/:id', CarrinhoController.addItem);
router.patch('/updateItem/:id/:produtoId', CarrinhoController.updateItem);
router.delete('/removeItem/:id/:produtoId', CarrinhoController.removeItem);
router.delete('/clear/:id', CarrinhoController.clear);

module.exports = router;
