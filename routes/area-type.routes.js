const express = require('express');
const router = express.Router();
const AreaTypeController = require('../controllers/area-type.controller')

router
    .route('/')
    .get(AreaTypeController.findAllAreaType)
    .post(AreaTypeController.createAreaType)

router
    .route('/:id')
    .get(AreaTypeController.findAreaTypeById)
    .put(AreaTypeController.updateAreaType)
    .delete(AreaTypeController.deleteAreaType)

module.exports = router;