const joi = require('joi');

exports.signUpValidator = async (req, res, next) => {
    const schema = joi.object({
        firstName: joi.string()
            .min(3)
            .max(30)
            .pattern(new RegExp('^[A-Za-z]+$'))
            .required().messages({
                'any.required': 'Firstname is required.',
                "string.min": "Firstname should be minimum of 3 characters.",
                "string.max": "Firstname should not be more than 30 characters long.",
                "string.empty": "Firstname is required.",
                "string.pattern.base": "Firstname can only contain letters, with no spaces"
            }),
            
        lastName: joi.string()
            .min(3)
            .max(30)
            .pattern(new RegExp('^[A-Za-z]+$'))
            .required().messages({
                'any.required': 'Lastname is required.',
                "string.min": "Lastname should be minimum of 3 characters.",
                "string.max": "Lastname should not be more than 30 characters long.",
                "string.empty": "Lastnamecannot be empty.",
                "string.pattern.base": "Lastname can only contain letters, with no spaces"
            }),

        email: joi.string()
            .email()
            .required().messages({
                "string.email": "Must be a valid email.",
                'any.required': 'Email is required.',
                "string.empty": "Email cannot be empty."
            }),
        
        password: joi.string()
            .pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'))
            .required().messages({
                'any.required': 'Password is required.',
                "string.empty": "Password cannot be empty.",
                "string.pattern.base": "Password must contain atleast: 8 characters long, a Uppercase, Lowercase, digits and a special character [#?!@$%^&*-]"
            })
    })

    const {error} = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    next()
};

exports.loginValidator = async (req, res, next) => {
    const schema = joi.object({
        email: joi.string()
            .email()
            .required().messages({
                "string.email": "Must be a valid email.",
                'any.required': 'Email is required.',
                "string.empty": "Email cannot be empty."
            }),

        password: joi.string()
        .required().messages({
            'any.required': 'Password is required.',
            "string.empty": "Password cannot be empty."
        })
    })

    const {error} = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    next()
}