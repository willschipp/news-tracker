var router = require('express').Router();

router.use('/markers',require('./markers'));
// router.use('/news',require('./news'));

module.exports = router;
