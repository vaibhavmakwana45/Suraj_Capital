const express = require("express");
const router = express.Router();
const moment = require("moment");
const Bank = require("../../models/Bank/BankSchema");
const BankUser = require("../../models/Bank/BankUserSchema");
const AddUser = require("../../models/AddUser");
const SuperAdmin = require("../../models/SuperAdminSignupSchema");
const SavajCapital_User = require("../../models/Savaj_Capital/SavajCapital_User");
const { createToken } = require("../../utils/authhelper");
const crypto = require("crypto");
const axios = require("axios");
const currentDate = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
const BankApproval = require("../../models/Bank/BankApproval");
const File_Uplode = require("../../models/File/File_Uplode");

router.post("/", async (req, res) => {
  try {
    let savajUser = await SavajCapital_User.findOne({
      email: req.body.email,
    });

    const user = await AddUser.findOne({ email: req.body.email });
    const bankUser = await BankUser.findOne({ email: req.body.email });
    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (savajUser || user || bankUser || superAdmin) {
      res.json({
        statusCode: 201,
        message: `${req.body.branch_name} Name Already Added`,
      });
    }
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    req.body["bankuser_id"] = uniqueId;
    req.body["createdAt"] = currentDate;
    req.body["updatedAt"] = currentDate;

    var data = await BankUser.create(req.body);
    const ApiResponse = await axios.post(
      `http://192.168.1.14:4010/api/setpassword/passwordmail`,
      {
        email: req.body.email,
      }
    );

    if (ApiResponse.status === 200) {
      res.json({
        success: true,
        data: data,
        message: "Add Branch Successfully",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete("/:bankuser_id", async (req, res) => {
  try {
    const { bankuser_id } = req.params;

    const deletedUser = await BankUser.findOneAndDelete({
      bankuser_id: bankuser_id,
    });

    if (!deletedUser) {
      return res.status(200).json({
        statusCode: 201,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      deletedRoleId: bankuser_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/:bankuser_id", async (req, res) => {
  try {
    const { bankuser_id } = req.params;
    let findEmail = await SavajCapital_User.findOne({
      email: req.body.email,
    });
    const user = await AddUser.findOne({ email: req.body.email });
    //   const bankUser = await BankUser.findOne({ email: req.body.email });
    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (findEmail || superAdmin || user) {
      return res
        .status(200)
        .send({ statusCode: 201, message: "Email already in use" });
    }

    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    if (!req.body.password) {
      delete req.body.password;
    }
    const result = await BankUser.findOneAndUpdate(
      { bankuser_id: bankuser_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Branch-User Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Branch-User not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.get("/:bank_id", async (req, res) => {
  try {
    const bank_id = req.params.bank_id;

    var data = await BankUser.aggregate([
      {
        $match: { bank_id: bank_id },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    const bank = await Bank.findOne({
      bank_id: bank_id,
    });

    //   for (let i = 0; i < data.length; i++) {
    //     const role_id = data[i].role_id;

    //     const branch_data = await SavajCapital_Role.findOne({ role_id: role_id });

    //     if (branch_data) {
    //       data[i].role = branch_data.role;
    //     }
    //   }

    const count = data.length;

    res.json({
      success: true,
      bank,
      data: data,
      count: count,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete("/deletebankuser/:bankId", async (req, res) => {
  try {
    const { bankId } = req.params;

    const deletedBankUser = await BankUser.findOneAndDelete({
      bankuser_id: bankId,
    });

    if (!deletedBankUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      message: "Bank User deleted successfully",
      deletedBankUserId: bankId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/assigned_file/:bankuser_id", async (req, res) => {
  try {
    const bankuser_id = req.params.bankuser_id;

    const bankApprovals = await BankApproval.find({
      bankuser_id: bankuser_id,
    }).sort({ updatedAt: -1 });

    if (!bankApprovals || bankApprovals.length === 0) {
      return res.json({
        success: false,
        message: "No bank approvals found for the specified bank user.",
        data: [],
      });
    }

    const fileIds = bankApprovals.map((approval) => approval.file_id);

    const fileDetails = await File_Uplode.find({ file_id: { $in: fileIds } });

    const fileDetailsMap = {};
    fileDetails.forEach((detail) => {
      fileDetailsMap[detail.file_id] = detail;
    });

    const augmentedData = bankApprovals.map((approval) => {
      const fileData = fileDetailsMap[approval.file_id];
      return {
        ...approval.toObject(),
        file_data: fileData || null,
      };
    });

    res.json({
      success: true,
      data: augmentedData,
      count: augmentedData.length,
      message: "Bank approvals data with file details retrieved successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
