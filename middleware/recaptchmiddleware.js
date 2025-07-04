const axios = require('axios');

const verifycaptcha = async (req, res, next) => {
  const { captcha } = req.body;
  if (!captcha) {
    return res.status(400).json({ message: 'Please complete the Recaptcha' });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`
    );
    if (response.data.success) {
      next();
    } else {
      return res.status(400).json({ message: 'Recaptcha verification failed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error in captcha verification' });
  }
};

module.exports = verifycaptcha;