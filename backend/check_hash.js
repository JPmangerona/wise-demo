const bcrypt = require('bcryptjs');
const hash = '$2b$10$oGTAtP9yoNaHUhSs2Dy/teKSDhNaGL6wF8ERyeRpbUAeJyMs2H5X.';
console.log('Comparing admin123:', bcrypt.compareSync('admin123', hash));
