const express = require("express");
const router = express.Router();
const moment = require("moment");
const Loan_Step = require("../../models/Loan_Step/Loan_Step");
const Compelete_Step = require("../../models/Loan_Step/Compelete_Step");
const Loan = require("../../models/Loan/Loan");
const File_Uplode = require("../../models/File/File_Uplode");
const { default: axios } = require("axios");
const Guarantor_Step = require("../../models/AddGuarantor/GuarantorStep");
const Guarantor = require("../../models/AddGuarantor/AddGuarantor");

// Post Loan-Step
router.post("/", async (req, res) => {
  try {
    let findLoanStep = await Loan_Step.findOne({
      loan_step: { $regex: new RegExp(`^${req.body.loan_step}$`, "i") },
    });
    if (!findLoanStep) {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;

      req.body["loan_step_id"] = uniqueId;
      req.body["createdAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      req.body["updatedAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      var data = await Loan_Step.create(req.body);
      res.json({
        success: true,
        data: data,
        message: "Add Loan Step Successfully",
      });
    } else {
      res.json({
        statusCode: 201,
        message: `${req.body.loan_step} Already Added`,
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// Get Loan-Step
router.get("/", async (req, res) => {
  try {
    const data = await Loan_Step.find({});
    if (data.length === 0) {
      // If no data found
      return res.status(201).json({
        statusCode: 201,
        message: "No data found",
      });
    }
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Put Loan-Step
router.put("/:loan_step_id", async (req, res) => {
  try {
    const { loan_step_id } = req.params;

    // Ensure that updatedAt field is set
    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    const result = await Loan_Step.findOneAndUpdate(
      { loan_step_id: loan_step_id },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.json({
        success: true,
        data: result,
        message: "Loan-Step Updated Successfully",
      });
    } else {
      res.status(202).json({
        statusCode: 202,
        message: "Loan-Step not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

// Delete Loan-Step
router.delete("/:loan_step_id", async (req, res) => {
  try {
    const { loan_step_id } = req.params;

    const loan = await Loan.findOne({ loan_step_id: { $in: [loan_step_id] } });
    if (loan) {
      return res.status(403).json({
        success: false,
        message: "Deletion not allowed: Loan-Step is referenced in a Loan",
      });
    }

    const deletedDocument = await Loan_Step.findOneAndDelete({
      loan_step_id: loan_step_id,
    });

    if (!deletedDocument) {
      return res.status(404).json({
        success: false,
        message: "Loan-Step not found",
      });
    }

    res.json({
      success: true,
      message: "Loan-Step deleted successfully",
      deletedStepId: loan_step_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// router.get("/get_steps/:file_id", async (req, res) => {
//   try {
//     const { file_id } = req.params;
//     const file = await File_Uplode.findOne({ file_id });
//     const loan = await Loan.findOne({ loan_id: file.loan_id });
//     const steps = [];

//     for (const loan_step_id of loan.loan_step_id) {
//       if (loan_step_id === "1715348523661") {
//         try {
//           const res = await axios.get(
//             `https://admin.savajcapital.com/api/file_upload/get_documents/${file_id}`
//           );

//           steps.push({ ...res.data.data, user_id: file.user_id });
//         } catch (error) {
//           console.error("Error: ", error.message);
//         }
//       } else {
//         const compelete_step = await Compelete_Step.findOne({
//           loan_step_id,
//           file_id,
//           user_id: file.user_id,
//         });
//         if (compelete_step) {
//           steps.push(compelete_step);
//         } else {
//           const step = await Loan_Step.findOne({ loan_step_id });
//           const inputs = step.inputs;
//           const isActive = inputs.some((input) => input.is_required);
//           const status = isActive ? "active" : "complete";
//           steps.push({ ...step.toObject(), status, user_id: file.user_id });
//         }
//       }
//     }

//     res.json({
//       statusCode: 200,
//       data: steps,
//       message: "Read All Request",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

// router.get("/get_steps/:file_id", async (req, res) => {
//   try {
//     const { file_id } = req.params;
//     const file = await File_Uplode.findOne({ file_id });
//     const loan = await Loan.findOne({ loan_id: file.loan_id });
//     const steps = [];

//     for (const loan_step_id of loan.loan_step_id) {
//       const stepData = await Loan_Step.findOne({ loan_step_id });

//       if (!stepData) {
//         continue;
//       }

//       if (loan_step_id === "1715348523661") {
//         try {
//           const res = await axios.get(
//             `https://localhost:5882/api/file_upload/get_documents/${file_id}`
//           );
//           steps.push({ ...res.data.data, user_id: file.user_id });
//         } catch (error) {
//           console.error("Error: ", error.message);
//         }
//       } else {
//         const compeleteStep = await Compelete_Step.findOne({
//           loan_step_id,
//           file_id,
//           user_id: file.user_id,
//         });

//         if (compeleteStep) {
//           const updatedInputs = stepData.inputs.map((input) => {
//             const existingInput = compeleteStep.inputs.find(
//               (ci) => ci.label === input.label
//             );
//             return existingInput || input;
//           });

//           steps.push({
//             ...compeleteStep.toObject(),
//             inputs: updatedInputs,
//             user_id: file.user_id,
//           });
//         } else {
//           const isActive = stepData.inputs.some((input) => input.is_required);
//           const status = isActive ? "active" : "complete";
//           steps.push({
//             ...stepData.toObject(),
//             status,
//             user_id: file.user_id,
//           });
//         }
//       }
//     }

//     res.json({
//       statusCode: 200,
//       data: steps,
//       message: "Read All Request",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

// router.get("/get_steps/:file_id", async (req, res) => {
//   try {
//     const { file_id } = req.params;
//     const file = await File_Uplode.findOne({ file_id });
//     if (!file) {
//       return res.status(404).json({ message: "File not found" });
//     }

//     const loan = await Loan.findOne({ loan_id: file.loan_id });
//     if (!loan) {
//       return res.status(404).json({ message: "Loan not found" });
//     }

//     const steps = [];
//     for (const loan_step_id of loan.loan_step_id) {
//       const stepData = await Loan_Step.findOne({ loan_step_id });
//       console.log(`Step Data for ${loan_step_id}:`, stepData);

//       if (!stepData) continue;

//       const completeStep = await Compelete_Step.findOne({
//         loan_step_id,
//         file_id,
//         user_id: file.user_id,
//       });
//       console.log(`Complete Step Data for ${loan_step_id}:`, completeStep);

//       const guarantorStep = await Guarantor_Step.findOne({
//         loan_step_id,
//         file_id,
//         user_id: file.user_id,
//       });
//       console.log(`Guarantor Step Data for ${loan_step_id}:`, guarantorStep);

//       let stepEntry = { ...stepData.toObject(), user_id: file.user_id };

//       if (completeStep) {
//         stepEntry = { ...stepEntry, completeStep: completeStep.toObject() };
//       }
//       if (guarantorStep) {
//         stepEntry = { ...stepEntry, guarantorStep: guarantorStep.toObject() };
//       }

//       steps.push(stepEntry);
//     }

//     console.log("Final steps data:", steps);
//     res.json({
//       statusCode: 200,
//       data: steps,
//       message: "Read All Request",
//     });
//   } catch (error) {
//     console.error("Error in get_steps:", error);
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// });

// router.post("/steps/:file_id", async (req, res) => {
//   try {
//     const { file_id } = req.params;
//     const timestamp = Date.now();
//     const uniqueId = `${timestamp}`;

//     const object = {
//       compelete_step_id: uniqueId,
//       loan_step_id: req.body.loan_step_id,
//       inputs: req.body.inputs,
//       loan_step: req.body.loan_step,
//       status: "complete",
//       file_id: file_id,
//       user_id: req.body.user_id,
//       createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
//       updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
//     };

//     var data = await Compelete_Step.create(object);
//     res.status(200).json({
//       statusCode: 200,
//       data: data,
//       message: "Step Completed Successfully.",
//     });
//   } catch (error) {
//     res.json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

router.get("/get_steps/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;
    const file = await File_Uplode.findOne({ file_id });
    const loan = await Loan.findOne({ loan_id: file.loan_id });
    const steps = [];

    for (const loan_step_id of loan.loan_step_id) {
      const stepData = await Loan_Step.findOne({ loan_step_id });

      if (!stepData) {
        continue;
      }

      if (loan_step_id === "1715348523661") {
        try {
          const res = await axios.get(
            `https://localhost:5882/api/file_upload/get_documents/${file_id}`
          );
          steps.push({ ...res.data.data, user_id: file.user_id });
        } catch (error) {
          console.error("Error: ", error.message);
        }
      } else {
        const compeleteStep = await Compelete_Step.findOne({
          loan_step_id,
          file_id,
          user_id: file.user_id,
        });

        if (compeleteStep) {
          const updatedInputs = stepData.inputs.map((input) => {
            const existingInput = compeleteStep.inputs.find(
              (ci) => ci.label === input.label
            );
            return existingInput || input;
          });

          const mergedStep = {
            ...compeleteStep.toObject(),
            inputs: updatedInputs,
            user_id: file.user_id,
          };

          // Fetch guarantor steps and merge
          const guarantorSteps = await Guarantor_Step.find({
            file_id,
            loan_step_id: compeleteStep.loan_step_id,
          });

          if (guarantorSteps.length > 0) {
            // Iterate over guarantorSteps to include guarantor username
            const stepsWithGuarantor = await Promise.all(guarantorSteps.map(async (guarantorStep) => {
              const guarantor = await Guarantor.findOne({ guarantor_id: guarantorStep.guarantor_id });
              const username = guarantor ? guarantor.username : null;
              return { ...guarantorStep.toObject(), username };
            }));

            mergedStep.guarantorSteps = stepsWithGuarantor;
          }

          steps.push(mergedStep);
        } else {
          const isActive = stepData.inputs.some((input) => input.is_required);
          const status = isActive ? "active" : "complete";
          steps.push({
            ...stepData.toObject(),
            status,
            user_id: file.user_id,
          });
        }
      }
    }

    res.json({
      statusCode: 200,
      data: steps,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/steps/:file_id", async (req, res) => {
  console.log(req.body);
  try {
    const { file_id } = req.params;
    const { loan_step_id, inputs, user_id, loan_step } = req.body;

    const existingStep = await Compelete_Step.findOne({
      loan_step_id,
      file_id,
      user_id,
    });

    if (existingStep) {
      const newInputMap = new Map(inputs.map((input) => [input.label, input]));

      existingStep.inputs = existingStep.inputs.map((input) => {
        if (newInputMap.has(input.label)) {
          return {
            ...input,
            ...newInputMap.get(input.label),
          };
        }
        return input;
      });

      newInputMap.forEach((value, key) => {
        if (!existingStep.inputs.some((input) => input.label === key)) {
          existingStep.inputs.push(value);
        }
      });

      existingStep.updatedAt = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      await existingStep.save();

      res.status(200).json({
        statusCode: 200,
        message: "Step Updated Successfully.",
      });
    } else {
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`;
      const newStep = {
        compelete_step_id: uniqueId,
        loan_step_id,
        inputs,
        loan_step,
        status: "complete",
        file_id,
        user_id,
        createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      };

      await Compelete_Step.create(newStep);

      res.status(200).json({
        statusCode: 200,
        message: "Step Created Successfully.",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
