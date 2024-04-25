// Chakra Icons
import { BellIcon } from "@chakra-ui/icons";
// Chakra Imports
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuGroup,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
// Assets
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
import { Row,Media,Col } from "reactstrap";

// Custom Icons
import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoDark,
  ChakraLogoLight,
  ProfileIcon,
  SettingsIcon,
} from "components/Icons/Icons";
import { FaSignOutAlt } from "react-icons/fa";
import { useHistory } from "react-router-dom";

// Custom Components
import { ItemContent } from "components/Menu/ItemContent";
import { SearchBar } from "components/Navbars/SearchBar/SearchBar";
import { SidebarResponsive } from "components/Sidebar/Sidebar";
import React,{useState, useEffect} from "react";
import { NavLink } from "react-router-dom";
import routes from "routes.js";

export default function HeaderLinks(props) {

  const [userdata, setuserdata] =useState([])
  useEffect(() => {
    const decodedToken = localStorage.getItem('decodedToken');
    if (decodedToken) {
      // console.log("objectttttttttt",parsedToken)
      const parsedToken = JSON.parse(decodedToken);
      const { superadmin_id } = parsedToken;

      setuserdata({
        firstname: parsedToken._id.firstname,
        lastname: parsedToken._id.lastname,
        email: parsedToken._id.email,
      });
    }
  }, []);

  const getInitials = () => {
    const { firstname, lastname } = userdata || {};
    return `${firstname ? firstname.charAt(0) : ''}${lastname ? lastname.charAt(0) : ''}`;
  };

  const {
    variant,
    children,
    fixed,
    scrolled,
    secondary,
    onOpen,
    name,
    ...rest
  } = props;
  console.log("name", name);
  const { colorMode } = useColorMode();

  // Chakra Color Mode
  let navbarIcon =
    fixed && scrolled
      ? useColorModeValue("gray.700", "gray.200")
      : useColorModeValue("white", "gray.200");
  let menuBg = useColorModeValue("white", "navy.800");
  if (secondary) {
    navbarIcon = "white";
  }
  const history = useHistory();
  const handleLogout = async () => {
    localStorage.removeItem("decodedToken");
    localStorage.removeItem("authToken");
    history.push("/auth/signin");
  };

  

  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
    >
      <SearchBar me="18px" />

      <SidebarResponsive
        hamburgerColor={"white"}
        logo={
          <Stack direction="row" spacing="12px" align="center" justify="center">
            {colorMode === "dark" ? (
              <ArgonLogoLight w="74px" h="27px" />
            ) : (
              <ArgonLogoDark w="74px" h="27px" />
            )}
            <Box
              w="1px"
              h="20px"
              bg={colorMode === "dark" ? "white" : "gray.700"}
            />
            {colorMode === "dark" ? (
              <ChakraLogoLight w="82px" h="21px" />
            ) : (
              <ChakraLogoDark w="82px" h="21px" />
            )}
          </Stack>
        }
        colorMode={colorMode}
        secondary={props.secondary}
        routes={routes}
        {...rest}
      />
      <SettingsIcon
        cursor="pointer"
        ms={{ base: "16px", xl: "0px" }}
        me="16px"
        onClick={props.onOpen}
        color={navbarIcon}
        w="18px"
        h="18px"
      />
      <Menu>
      
        <MenuButton>
          <BellIcon color={navbarIcon} w="18px" h="18px" />
        </MenuButton>
        <MenuList p="16px 8px" bg={menuBg} mt="10px">
          <Flex flexDirection="column">
            {name === "/superadmin" && (
              <>
                <MenuItem borderRadius="8px" mb="10px">
                  <ItemContent
                    time="13 minutes ago"
                    info="from Alicia"
                    boldInfo="New Message"
                    aName="Alicia"
                    aSrc={avatar1}
                  />
                </MenuItem>
                <MenuItem borderRadius="8px" mb="10px">
                  <ItemContent
                    time="2 days ago"
                    info="by Josh Henry"
                    boldInfo="New Album"
                    aName="Josh Henry"
                    aSrc={avatar2}
                  />
                </MenuItem>
              </>
            )}
            {name === "/bank" && (
              <MenuItem borderRadius="8px">
                <ItemContent
                  time="3 days ago"
                  info="Payment successfully completed!"
                  boldInfo=""
                  aName="Kara"
                  aSrc={avatar3}
                />
              </MenuItem>
            )}
          </Flex>
        </MenuList>
      </Menu>
      <Menu>
     
        <MenuButton>
          <ProfileIcon
            color={navbarIcon}
            w="22px"
            h="22px"
            style={{ marginLeft: "20px" }}
          />
        </MenuButton>
        <MenuList p="16px 8px" bg={menuBg} mt="10px">
          <Flex flexDirection="column">
          <MenuGroup>
        <Row>
          <Col>
          <Media className="align-items-center">
                <span
                  className="d-flex justify-content-center align-items-center p-1"
                  style={{
                    width: "40px",
                    height: "45px",
                    backgroundColor: "rgba(21, 43, 81, 1)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                >   
                  {`${userdata?.firstname
                    ?.slice(0, 1)
                    .toUpperCase()}${userdata?.lastname
                    ?.slice(0, 1)
                    .toUpperCase()}`}
                </span>
                </Media>
          </Col>
          <Col style={{marginBottom:"10px"}}>
              <Text>
                {userdata?.firstname} {userdata?.lastname}
              </Text>
              <Text style={{fontSize:"small"}}>
                {userdata.email}
              </Text>
          </Col>
        </Row>
      </MenuGroup>
            <MenuItem borderRadius="8px" onClick={handleLogout}>
              <Flex align="center" justifyContent="flex-start">
                <FaSignOutAlt color="currentColor" pr="20px" />
                Logout
              </Flex>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}
