import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";// Add axios to your imports// Add axios to your imports
import axios from "axios";
import {
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Td,
  useColorModeValue,
  Button,
  Input
} from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TablesTableRow from "components/Tables/TablesTableRow";
import { RocketIcon } from "components/Icons/Icons";
import AxiosInstance from "config/AxiosInstance";
import Loader from "react-js-loader";

import TableComponent from "TableComponent";

function Tables() {
  const [banks, setBanks] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("");
  let menuBg = useColorModeValue("white", "navy.800");

  const filteredUsers = searchTerm.length === 0
    ? banks
    : banks.filter((bank) =>
      bank.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.state.toLowerCase().includes(searchTerm.toLowerCase())
      // bank.users.some((user) =>
      //   user.email.toLowerCase().includes(searchTerm.toLowerCase())
      // )
    );

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await AxiosInstance.get("/addbankuser");
        console.log(response.data.data)
        setBanks(response.data.data);
        setLoading(false)
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };

    fetchBanks();
  }, []);

  const navigateToAnotherPage = (id) => {
    if (id) {
      history.push("/superadmin/addbank?id=" + id);
      return;
    }
    history.push("/superadmin/addbank");
  };

  const navigateToAnotherPageUser = (id) => {
    if (id) {
      history.push("/superadmin/addbankuser?id=" + id);
      return;
    }
    history.push("/superadmin/addbankuser");
  };

  const allHeaders = ["Bank Name", "Branch Name", "City",  "State", "users", "Action",];
  
  const formattedData = filteredUsers.map(bank => ([
    bank.bank_id,
    bank.bank_name,
    bank.branch_name,
    bank.city,
    bank.state,
    bank?.user_count,
  ]));

  const formattedCollapsedData = filteredUsers.map(bank => ([
    bank.bank_id,
  ]));

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const cancelRef = React.useRef();
  const deleteBank = async (bankId) => {
    try {
      await AxiosInstance.delete(`/addbankuser/deletebanks/${bankId}`);
      setBanks(banks.filter((bank) => bank.bank_id !== bankId));
      setIsDeleteDialogOpen(false);
      toast.success("Bank deleted successfully!");
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error("bank not delete");
    }
  };


  const handleDelete = (id) => {
    setSelectedBankId(id);
    setIsDeleteDialogOpen(true);
  }

  const handleEdit = (id) => {
    navigateToAnotherPage(id)
  }

  const handleRow = (id) => {
    history.push("/superadmin/bankusers?id="+id)
}

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">

              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Banks and Users
              </Text>
              <div>

                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />

                <Menu>
                  <MenuButton>
                    <Button onClick={navigateToAnotherPage} colorScheme="blue">
                      ...
                    </Button>
                  </MenuButton>
                  <MenuList p="16px 8px" bg={menuBg} mt="10px">
                    <Flex flexDirection="column" style={{ gap: 10 }}>
                      <MenuItem borderRadius="8px" onClick={() => { navigateToAnotherPage() }}>
                        <Flex align="center" justifyContent="flex-start">
                          Add Bank
                        </Flex>
                      </MenuItem>
                      <MenuItem borderRadius="8px" onClick={() => { navigateToAnotherPageUser() }}>
                        <Flex align="center" justifyContent="flex-start">
                          Add Bank User
                        </Flex>
                      </MenuItem>
                    </Flex>
                  </MenuList>
                </Menu>

              </div>
            </Flex>
          </CardHeader>
          <CardBody>

            <TableComponent
              banks={banks}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              handleRow={handleRow}
            />

          </CardBody>
        </Card>
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Bank
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? You can't undo this action afterwards.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => deleteBank(selectedBankId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
      <Toaster />
    </>
  );
}

export default Tables;