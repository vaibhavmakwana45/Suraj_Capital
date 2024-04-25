import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Switch,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

function AddLoanDocuments() {
  const textColor = useColorModeValue("gray.700", "white");
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const subtypeRefs = useRef([]);
  const [formData, setFormData] = useState({
    loan_type: "",
    loan_documents: [""],
  });

  const [loandata, setLoanData] = useState([]);
  console.log(loandata, "loandata");

  const getLoanData = async () => {
    try {
      const response = await AxiosInstance.get("/loan/loan");

      if (response.data.success) {
        setLoanData(response.data.data);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getLoanData();
  }, []);

  const [loanType, setLoanType] = useState([]);
  const [subType, setSubType] = useState(null);
  const [loanName, setLoanName] = useState("");
  const getData = async (loanId) => {
    try {
      // Make the API call with the loan_id parameter
      const response = await AxiosInstance.get(
        `/loan_type/loan_type/${loanId}`
      );

      if (response.data.success) {
        // Set the loanType state with the received data
        setLoanType(response.data.data);
        setLoanName(response?.data?.loan[0]?.loan);
        setSubType(response.data.loan[0].is_subtype);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleChangeSubtype = (e, index) => {
    const { name, value } = e.target;
    const subtypes = [...formData.loan_documents];
    subtypes[index] = value;
    setFormData({
      ...formData,
      loan_documents: subtypes,
    });
  };

  const handleAddSubtype = () => {
    setFormData({
      ...formData,
      loan_documents: [...formData.loan_documents, ""],
    });
  };

  const handleRemoveSubtype = (index) => {
    const subtypes = [...formData.loan_documents];
    subtypes.splice(index, 1);

    console.log("subtype.splice", subtypes.splice(index, 1));
    setFormData({
      ...formData,
      loan_documents: subtypes,
    });
  };

  useEffect(() => {
    const secondLastSubtype =
      formData.loan_documents[formData.loan_documents.length - 2];
    const lastSubtype =
      formData.loan_documents[formData.loan_documents.length - 1];
    if (secondLastSubtype !== "" && lastSubtype !== "") {
      handleAddSubtype();
    } else if (
      secondLastSubtype === "" &&
      lastSubtype === "" &&
      formData.loan_documents.length > 1
    ) {
      handleRemoveSubtype(formData.loan_documents.length - 1);
    }
  }, [formData.loan_documents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        loan_id: formData.loan_id,
        loantype_id: formData.loantype_id,
        loan_document: formData.loan_documents.slice(
          0,
          formData.loan_documents.length - 1
        ),
      };

      const response = await AxiosInstance.post(`/loan_docs/`, data);
      if (response.data.success) {
        const msg = "Loan Added Successfully!";
        toast.success(msg);
        history.push("/superadmin/loan");
      } else {
        toast.error("Please try again later!");
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add Documents
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <FormControl id="savajcapitalbranch_name" isRequired mt={4}>
                <FormLabel>Select Loan</FormLabel>
                <Select
                  name="city"
                  placeholder="Select Loan-Type"
                  onChange={(e) => {
                    const selectedLoanId = e.target.value;
                    setFormData({ ...formData, loan_id: selectedLoanId });
                    // Call getData with the selected loan_id
                    getData(selectedLoanId);
                  }}
                >
                  {loandata.map((index) => (
                    <option key={index.loan_id} value={index.loan_id}>
                      {index.loan}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="savajcapitalbranch_name" mt={4}>
 
  {subType === true && (loanName !== 'Car' && loanName !== 'CRL-Car Loan' )? (
    <>
     <FormLabel>Select Loan-Type</FormLabel>
    <Select
      name="city"
      placeholder="Select Loan-Type"
      onChange={(e) =>
        setFormData({ ...formData, loantype_id: e.target.value })
      }
    >
      <option key="title" disabled style={{ fontWeight: 800 }}>
        {loanName}
      </option>
      {loanType.map((index) => (
        <option key={index.loantype_id} value={index.loantype_id}>
          {index.loan_type}
        </option>
      ))}
    </Select>
    </>
  ) : (
    <></>
  )}
</FormControl>


              {formData.loan_documents.map((subtype, index) => (
                <FormControl key={index} id={`loan_document_${index}`} mt={8}>
                  <FormLabel>{`Loan Documents ${index + 1}`}</FormLabel>
                  <Flex alignItems="center">
                    <Input
                      name={`loan_document_${index}`}
                      onChange={(e) => handleChangeSubtype(e, index)}
                      value={subtype}
                      ref={(inputRef) =>
                        (subtypeRefs.current[index] = inputRef)
                      }
                      mr={2} // Add some margin to the right of the input
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveSubtype(index)}
                      colorScheme="red"
                    >
                      Remove
                    </Button>
                  </Flex>
                </FormControl>
              ))}

              <div>
                <Button
                  mt={4}
                  colorScheme="teal"
                  type="submit"
                  isLoading={loading}
                  loadingText="Submitting"
                  style={{ marginTop: 40 }}
                >
                  Submit
                </Button>

                <Button
                  mt={4}
                  colorScheme="yellow"
                  style={{ marginTop: 40, marginLeft: 8 }}
                  onClick={() => history.push("/superadmin/loan")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default AddLoanDocuments;
