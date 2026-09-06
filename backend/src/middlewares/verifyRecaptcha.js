const axios = require('axios');

const verifyRecaptcha = async (req, res, next) => {
    const { captchaToken } = req.body;

    try {
        if (!captchaToken) {
            return res.status(400).json({ message: 'Captcha requerido' });
        }

        const verificationResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET,
                    response: captchaToken
                }
            }
        );

        if (!verificationResponse.data.success) {
            return res.status(400).json({ message: 'Captcha inválido' });
        }

        next();
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ message: 'Error al verificar el captcha. Intente más tarde.' });
    }
};

module.exports = verifyRecaptcha;
