const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
const saltRound = 10;

// write a function to convert password into hash
const hashPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(saltRound);
  const hash = await bcrypt.hash(pwd, salt);
  return hash;
};

//write a function compare the hashpwd and pwd
const hashCompare = async (pwd, hash) => {
  try {
    const result = await bcrypt.compare(pwd, hash);
    return result;
  } catch (error) {
    console.error("Error in hash comparison:", error);
    throw error; // Rethrow the error to handle it accordingly in your code
  }
};

const bankUserToken = async (
  _id,
  bankuser_id,
  bank_id,
  email,
  createdAt,
  updatedAt
) => {
  const payload = {
    _id: _id,
    bankuser_id: bankuser_id,
    bank_id: bank_id,
    email: email,
    role: "bankuser",
    createdAt: createdAt,
    updatedAt: updatedAt,
  };

  const token = await JWT.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });

  const decoded = JWT.verify(token, secret);
  const expiresIn = new Date(decoded.exp * 1000);

  return { token, expiresIn };
};

const superAdminToken = async (
  _id,
  superadmin_id,
  firstname,
  lastname,
  email,
  phonenumber,
  createdAt,
  updatedAt
) => {
  const payload = {
    _id: _id,
    superadmin_id: superadmin_id,
    email: email,
    role: "superadmin",
    firstname: firstname,
    lastname: lastname,
    phonenumber: phonenumber,
    createdAt: createdAt,
    updatedAt: updatedAt,
  };

  const token = await JWT.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });

  const decoded = JWT.verify(token, secret);
  const expiresIn = new Date(decoded.exp * 1000);

  return { token, expiresIn };
};

module.exports = { hashPassword, hashCompare, bankUserToken, superAdminToken };
