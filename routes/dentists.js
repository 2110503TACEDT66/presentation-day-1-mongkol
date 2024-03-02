const express = require('express');
const {protect,authorize} = require('../middleware/auth');
const {getDentists, getDentist, createDentist, updateDentist, deleteDentist} = require('../controllers/dentist');
const router = express.Router();

router.route('/')
    .get(getDentists)
    .post(protect , authorize('admin') , createDentist);
router.route('/:id')
    .get(getDentist)
    .put(protect , authorize('admin') , updateDentist)
    .delete(protect , authorize('admin') , deleteDentist);

module.exports = router;