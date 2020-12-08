const { check } = require('express-validator');

exports.validateInput = (method) =>{
    switch (method) {
        case 'signup': {
          return [
            check('email').notEmpty().isEmail(),
            check('password').notEmpty().isLength({ min: 3 })
          ];
        }
        default: {
            return [];
          }
    }
}