//route
const express = require('express');
const controller = require('../controllers/entregador.controller');

const router = express.Router();

router.post('/', controller.criar);
router.get('/', controller.listar);
router.get('/:id', controller.buscar);
router.put('/:id/localizacao', controller.atualizarLocalizacao);
router.put('/:id/status', controller.atualizarStatus);

module.exports = router;
