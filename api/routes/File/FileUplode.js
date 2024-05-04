const express = require("express");
const router = express.Router();
const moment = require("moment");
const File_Uplode = require("../../models/File/File_Uplode");
const SavajCapital_User = require("../../models/Savaj_Capital/SavajCapital_User");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");
const Loan_Documents = require("../../models/Loan/Loan_Documents");
const SavajCapital_Branch = require("../../models/Savaj_Capital/SavajCapital_Branch");
const AddUser = require("../../models/AddUser");
const AddDocuments = require("../../models/AddDocuments/AddDocuments");
const SavajCapital_Role = require("../../models/Savaj_Capital/SavajCapital_Role");
const Title = require("../../models/AddDocuments/Title");

router.post("/", async (req, res) => {
  try {
    const uniqueId = `F${moment().format("YYYYMMDDHHmmss")}`;
    const timestampForDocId = Date.now();

    req.body["file_id"] = uniqueId;
    req.body["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    req.body.documents.forEach((doc) => {
      doc.doc_id = `${timestampForDocId}_${Math.floor(Math.random() * 1000)}`;
    });

    var data = await File_Uplode.create(req.body);
    res.json({
      success: true,
      data: data,
      message: "Add Role Successfully",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    var data = await File_Uplode.aggregate([
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    for (let i = 0; i < data.length; i++) {
      const branchuser_id = data[i].branchuser_id;
      const user_id = data[i].user_id;
      const loan_id = data[i].loan_id;
      const loantype_id = data[i].loantype_id;

      const branchUserData = await SavajCapital_User.findOne({
        branchuser_id: branchuser_id,
      });

      const userData = await AddUser.findOne({ user_id: user_id });
      const loanData = await Loan.findOne({
        loan_id: loan_id,
      });
      const loanTypeData = await Loan_Type.findOne({
        loantype_id: loantype_id,
      });

      if (branchUserData) {
        data[i].brachuser_full_name = branchUserData.full_name;
      }

      if (userData) {
        data[i].user_username = userData.username;
      }
      if (loanData) {
        data[i].loan = loanData.loan;
      }
      if (loanTypeData) {
        data[i].loan_type = loanTypeData.loan_type;
      }

      let documentCount;
      if (loantype_id === "") {
        documentCount = await Loan_Documents.countDocuments({
          loan_id: loan_id,
        });
      } else {
        documentCount = await Loan_Documents.countDocuments({
          loantype_id: loantype_id,
        });
      }

      let loan_doc_data;
      if (loantype_id === "") {
        loan_doc_data = await Loan_Documents.find({
          loan_id: loan_id,
        }).limit(documentCount);
      } else {
        loan_doc_data = await Loan_Documents.find({
          loantype_id: loantype_id,
        }).limit(documentCount);
      }

      data[i].loan_document_ids = loan_doc_data.map((doc) => ({
        loan_document_id: doc.loan_document_id,
        loan_document: doc.loan_document,
      }));

      data[i].loan_document_ids.forEach((doc) => {
        const found = data[i].documents.some(
          (d) => d.loan_document_id === doc.loan_document_id
        );
        doc.is_uploaded = found;
      });

      const uploadedDocumentsCount = data[i].documents.length;
      let percentage = ((uploadedDocumentsCount / documentCount) * 100).toFixed(
        2
      );

      data[i].document_count = documentCount;
      data[i].document_percentage = parseFloat(percentage);

      data[i].uploaded_documents_count = uploadedDocumentsCount;
    }

    const count = data.length;

    res.json({
      statusCode: 200,
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

// Assuming Title model is imported and available

router.get("/file_upload/:file_id", async (req, res) => {
  try {
    const file_id = req.params.file_id;

    const fileData = await File_Uplode.findOne({ file_id: file_id });

    const loan = await Loan.findOne({ loan_id: fileData.loan_id });

    const user = await AddUser.findOne({ user_id: fileData.user_id });

    const loanType = await Loan_Type.findOne({
      loantype_id: fileData?.loantype_id,
    });

    // const savajcapitalbranch = await SavajCapital_Branch.findOne({
    //   branch_id: fileData.branch_id,
    // });

    // const savajcapitalbranchuser = await SavajCapital_User.findOne({
    //   branchuser_id: fileData.branchuser_id,
    // });

    const documentDetails = await Promise.all(
      fileData.documents.map(async (doc) => {
        const loanDocument = await Loan_Documents.findOne({
          loan_document_id: doc.loan_document_id,
        });

        // Fetch title name using title_id
        const title = await Title.findOne({ title_id: doc.title_id });

        const documentName = await AddDocuments.findOne({
          document_id: doc.loan_document_id,
        });

        return {
          file_path: doc.file_path,
          loan_document_id: doc.loan_document_id,
          document_name: documentName
            ? documentName.document
            : "Document name not found",
          doc_id: doc.doc_id,
          title_id: doc.title_id,
          // loan_document: loanDocument
          //   ? loanDocument.loan_document
          //   : "Document name not found",
          title: title ? title.title : "Title not found",
        };
      })
    );

    // Group documents by title names
    const groupedFiles = documentDetails.reduce((acc, curr) => {
      if (!acc[curr.title]) {
        acc[curr.title] = [];
      }
      acc[curr.title].push(curr);
      return acc;
    }, {});

    const responseData = {
      file: {
        _id: fileData._id,
        branch_id: fileData.branch_id,
        branchuser_id: fileData.branchuser_id,
        user_id: fileData.user_id,
        loan_id: fileData.loan_id,
        loantype_id: fileData?.loantype_id,
        file_id: fileData.file_id,
        loan: loan.loan,
        loan_type: loanType?.loan_type,
        username: user?.username,
        // branch_name: savajcapitalbranch.branch_name,
        // full_name: savajcapitalbranchuser.full_name,
        documents: groupedFiles, // Include grouped documents
        createdAt: fileData.createdAt,
        updatedAt: fileData.updatedAt,
        __v: fileData.__v,
      },
    };

    res.json({
      statusCode: 200,
      data: responseData,
      message: "Loan details retrieved successfully",
    });
  } catch (error) {
    console.error("Error during data retrieval:", error);
    res.status(500).json({ message: error.message });
  }
});

// router.get("/file_upload/:file_id", async (req, res) => {
//   try {
//     const file_id = req.params.file_id;

//     const fileData = await File_Uplode.findOne({ file_id: file_id });

//     const loan = await Loan.findOne({ loan_id: fileData.loan_id });

//     const user = await AddUser.findOne({ user_id: fileData.user_id });

//     const loanType = await Loan_Type.findOne({
//       loantype_id: fileData?.loantype_id,
//     });

//     const savajcapitalbranch = await SavajCapital_Branch.findOne({
//       branch_id: fileData.branch_id,
//     });

//     const savajcapitalbranchuser = await SavajCapital_User.findOne({
//       branchuser_id: fileData.branchuser_id,
//     });

//     const documentDetails = await Promise.all(
//       fileData.documents.map(async (doc) => {
//         const loanDocument = await Loan_Documents.findOne({
//           loan_document_id: doc.loan_document_id,
//         });
//         return {
//           file_path: doc.file_path,
//           loan_document_id: doc.loan_document_id,
//           doc_id: doc.doc_id,
//           title_id: doc.title_id,
//           loan_document: loanDocument
//             ? loanDocument.loan_document
//             : "Document name not found",
//         };
//       })
//     );

//     const responseData = {
//       file: {
//         _id: fileData._id,
//         user_id: fileData.user_id,
//         loan_id: fileData.loan_id,
//         loantype_id: fileData?.loantype_id,
//         file_id: fileData.file_id,
//         loan: loan.loan,
//         loan_type: loanType?.loan_type,
//         username: user?.username,
//         branch_name: savajcapitalbranch.branch_name,
//         full_name: savajcapitalbranchuser.full_name,
//         documents: documentDetails,
//         createdAt: fileData.createdAt,
//         updatedAt: fileData.updatedAt,
//         __v: fileData.__v,
//       },
//     };

//     res.json({
//       statusCode: 200,
//       data: responseData,
//       message: "Loan details retrieved successfully",
//     });
//   } catch (error) {
//     console.error("Error during data retrieval:", error);
//     res.status(500).json({ message: error.message });
//   }
// });

router.get("/edit_file_upload/:file_id", async (req, res) => {
  try {
    const file_id = req.params.file_id;

    const fileData = await File_Uplode.findOne({ file_id: file_id });

    if (!fileData) {
      return res.status(404).json({
        statusCode: 404,
        message: "File not found",
      });
    }
    const responseData = {
      fileDetails: fileData,
    };

    res.json({
      statusCode: 200,
      data: responseData,
      message: "File details retrieved successfully",
    });
  } catch (error) {
    console.error("Error during data retrieval:", error);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete("/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;

    const deletedFile = await File_Uplode.findOneAndDelete({
      file_id: file_id,
    });

    if (!deletedFile) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.json({
      success: true,
      message: "File deleted successfully",
      deletedFileId: file_id,
    });
  } catch (error) {
    console.error(`Error when trying to delete file: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const updateData = req.body;

    if (updateData.documents && updateData.documents.length > 0) {
      const timestampForDocId = moment().unix();
      updateData.documents.forEach((doc, index) => {
        doc.doc_id = `${timestampForDocId}_${Math.floor(
          Math.random() * 1000
        )}_${index}`;
      });
    }

    updateData.updatedAt = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    const updatedFile = await File_Uplode.findOneAndUpdate(
      { file_id: file_id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({
        statusCode: 404,
        message: "File not found",
      });
    }

    res.json({
      statusCode: 200,
      success: true,
      message: "File updated successfully",
      data: updatedFile,
    });
  } catch (error) {
    console.error(`Error when trying to update file: ${error}`);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

router.get("/get/:branchuser_id", async (req, res) => {
  try {
    const branchuser_id = req.params.branchuser_id;

    var data = await File_Uplode.aggregate([
      { $match: { branchuser_id: branchuser_id } },
      { $sort: { updatedAt: -1 } },
    ]).option({ maxTimeMS: 30000 });

    const branch = await SavajCapital_Branch.findOne({
      branchuser_id: data.branchuser_id,
    });

    for (let i = 0; i < data.length; i++) {
      const branchuser_id = data[i].branchuser_id;
      const user_id = data[i].user_id;
      const loan_id = data[i].loan_id;
      const loantype_id = data[i].loantype_id;

      const branchUserData = await SavajCapital_User.findOne({
        branchuser_id: branchuser_id,
      });

      const userData = await AddUser.findOne({ user_id: user_id });
      const loanData = await Loan.findOne({
        loan_id: loan_id,
      });
      const loanTypeData = await Loan_Type.findOne({
        loantype_id: loantype_id,
      });

      if (branchUserData) {
        data[i].brachuser_full_name = branchUserData.full_name;
      }

      if (userData) {
        data[i].user_username = userData.username;
      }
      if (loanData) {
        data[i].loan = loanData.loan;
      }
      if (loanTypeData) {
        data[i].loan_type = loanTypeData.loan_type;
      }

      let documentCount;
      if (loantype_id === "") {
        documentCount = await Loan_Documents.countDocuments({
          loan_id: loan_id,
        });
      } else {
        documentCount = await Loan_Documents.countDocuments({
          loantype_id: loantype_id,
        });
      }

      let loan_doc_data;
      if (loantype_id === "") {
        loan_doc_data = await Loan_Documents.find({
          loan_id: loan_id,
        }).limit(documentCount);
      } else {
        loan_doc_data = await Loan_Documents.find({
          loantype_id: loantype_id,
        }).limit(documentCount);
      }

      data[i].loan_document_ids = loan_doc_data.map((doc) => ({
        loan_document_id: doc.loan_document_id,
        loan_document: doc.loan_document,
      }));

      data[i].loan_document_ids.forEach((doc) => {
        const found = data[i].documents.some(
          (d) => d.loan_document_id === doc.loan_document_id
        );
        doc.is_uploaded = found;
      });

      const uploadedDocumentsCount = data[i].documents.length;
      let percentage = ((uploadedDocumentsCount / documentCount) * 100).toFixed(
        2
      );

      data[i].document_count = documentCount;
      data[i].document_percentage = parseFloat(percentage);

      data[i].uploaded_documents_count = uploadedDocumentsCount;
    }

    const count = data.length;

    res.json({
      success: true,
      branch,
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

router.get("/allfiles", async (req, res) => {
  try {
    var data = await File_Uplode.aggregate([
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    const count = data.length;

    res.json({
      statusCode: 200,
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

router.get("/testfile/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const data = await File_Uplode.findOne({ file_id });
    const loanIds = data.documents.map((item) => {
      return {
        loan_document_id: item.loan_document_id,
        title_id: item.title_id,
      };
    });

    const { loan_id, loantype_id } = data;
    const data2 = await Loan_Documents.find({ loan_id, loantype_id });
    const loanDocumentIds = data2.flatMap((item) => {
      return item.document_ids.map((loan_document_id) => {
        return {
          loan_document_id,
          title_id: item.title_id,
        };
      });
    });

    const commonIds = loanIds.filter((id) =>
      loanDocumentIds.some(
        (docId) =>
          docId.loan_document_id === id.loan_document_id &&
          docId.title_id === id.title_id
      )
    );

    const differentIds = loanDocumentIds.filter(
      (id) =>
        !loanIds.some(
          (docId) =>
            docId.loan_document_id === id.loan_document_id &&
            docId.title_id === id.title_id
        )
    );

    const approvedObject = [];
    const pendingObject = [];

    for (const item of commonIds) {
      const document = await AddDocuments.findOne({
        document_id: item.loan_document_id,
      });
      const title = await Title.findOne({
        title_id: item.title_id,
      });
      approvedObject.push({
        name: document.document,
        status: "Uploaded",
        title: title.title,
      });
    }

    for (const item of differentIds) {
      const document = await AddDocuments.findOne({
        document_id: item.loan_document_id,
      });
      const title = await Title.findOne({
        title_id: item.title_id,
      });
      pendingObject.push({
        name: document.document,
        status: "Pending",
        title: title.title,
      });
    }

    const diff = (approvedObject.length * 100) / loanDocumentIds.length;

    res.json({
      statusCode: 200,
      data: {
        approvedData: approvedObject,
        pendingData: pendingObject,
        file_id: file_id,
        document_percentage: parseInt(diff),
      },
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
