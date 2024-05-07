// Chakra Imports
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Link,
  Stack,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import AdminNavbarLinks from "./AdminNavbarLinks";
import routes from "../../routes";
import "./navbar-responsive.css";
import { SidebarResponsive } from "components/Sidebar/Sidebar";
import { ArgonLogoLight } from "components/Icons/Icons";
import { ArgonLogoDark } from "components/Icons/Icons";
import { ChakraLogoLight } from "components/Icons/Icons";
import { ChakraLogoDark } from "components/Icons/Icons";

const filteredRoutes = routes.filter((route) => route.layout !== "/auth");

function formatPathSegment(pathSegment) {
  return pathSegment
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", changeNavbar);

    return () => {
      window.removeEventListener("scroll", changeNavbar);
    };
  });

  const {
    variant,
    children,
    fixed,
    secondary,
    brandText,
    onOpen,
    ...rest
  } = props;
  console.log(props);
  let mainText =
    fixed && scrolled
      ? useColorModeValue("gray.700", "gray.200")
      : useColorModeValue("white", "gray.200");
  let secondaryText =
    fixed && scrolled
      ? useColorModeValue("gray.700", "gray.200")
      : useColorModeValue("white", "gray.200");
  let navbarPosition = "absolute";
  let navbarFilter = "none";
  let navbarBackdrop = "none";
  let navbarShadow = "none";
  let navbarBg = "none";
  let navbarBorder = "transparent";
  let secondaryMargin = "0px";
  let paddingX = "15px";
  if (props.fixed === true)
    if (scrolled === true) {
      navbarPosition = "fixed";
      navbarShadow = useColorModeValue(
        "0px 7px 23px rgba(0, 0, 0, 0.05)",
        "none"
      );
      navbarBg = useColorModeValue(
        "linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)",
        "linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)"
      );
      navbarBorder = useColorModeValue("#FFFFFF", "rgba(255, 255, 255, 0.31)");
      navbarFilter = useColorModeValue(
        "none",
        "drop-shadow(0px 7px 23px rgba(0, 0, 0, 0.05))"
      );
    }
  if (props.secondary) {
    navbarBackdrop = "none";
    navbarPosition = "absolute";
    mainText = "white";
    secondaryText = "white";
    secondaryMargin = "22px";
    paddingX = "30px";
  }
  const changeNavbar = () => {
    if (window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  const findRouteByKey = (key) =>
    filteredRoutes.find((route) => route.key === key);

  const generateBreadcrumbItems = (currentRoute, items = []) => {
    if (!currentRoute) return items;

    const parentRoute = currentRoute.parent
      ? findRouteByKey(currentRoute.parent)
      : null;

    // if (parentRoute) {
    //   generateBreadcrumbItems(parentRoute, items);
    // }

    if (items.length === 0) {
      items.push(
        <BreadcrumbItem key="superadmin">
          <BreadcrumbLink
            href="/superadmin"
            color="white"
            _hover={{ color: "white" }}
          >
            Superadmin
          </BreadcrumbLink>
        </BreadcrumbItem>
      );
    }

    const routeName = formatPathSegment(currentRoute.name);
    const isLast =
      currentRoute.path ===
      window.location.pathname.replace(currentRoute.layout, "");

    items.push(
      <BreadcrumbItem key={currentRoute.key} isCurrentPage={isLast}>
        <BreadcrumbLink
          href={currentRoute.layout + currentRoute.path}
          color={isLast ? "white" : "white"}
        >
          {routeName}
        </BreadcrumbLink>
      </BreadcrumbItem>
    );

    return items;
  };

  const generateBreadcrumbs = () => {
    const pathname = window.location.pathname;
    const currentRoute = filteredRoutes.find(
      (route) => route.layout + route.path === pathname
    );
    return generateBreadcrumbItems(currentRoute);
  };

  const { colorMode } = useColorMode();
  // Chakra color mode
  let bgButton = useColorModeValue("white", "navy.900");
  let colorButton = useColorModeValue("gray.700", "white");
  let hamburgerColor = {
    base: useColorModeValue("gray.700", "white"),
    md: "white",
  };
  return (
    <Flex
      className="navbar-responsive"
      position={navbarPosition}
      boxShadow={navbarShadow}
      bg={navbarBg}
      borderColor={navbarBorder}
      filter={navbarFilter}
      backdropFilter={navbarBackdrop}
      borderWidth="1.5px"
      borderStyle="solid"
      transitionDelay="0s, 0s, 0s, 0s"
      transitionDuration=" 0.25s, 0.25s, 0.25s, 0s"
      transition-property="box-shadow, background-color, filter, border"
      transitionTimingFunction="linear, linear, linear, linear"
      alignItems={{ xl: "center" }}
      borderRadius="16px"
      display="flex"
      minH="75px"
      justifyContent={{ xl: "center" }}
      lineHeight="25.6px"
      mx="auto"
      mt={secondaryMargin}
      pb="8px"
      left={document.documentElement.dir === "rtl" ? "30px" : ""}
      right={document.documentElement.dir === "rtl" ? "" : "30px"}
      px={{
        sm: paddingX,
        md: "30px",
      }}
      ps={{
        xl: "12px",
      }}
      pt="8px"
      top="18px"
      w={{ sm: "calc(100vw - 30px)", xl: "calc(100vw - 75px - 275px)" }}
      style={{ zIndex: "9", backgroundColor: "transparent" }}
    >
      <Flex
        w="100%"
        flexDirection={{
          sm: "column",
          md: "row",
        }}
        alignItems={{ xl: "center" }}
      >
        <SidebarResponsive
          hamburgerColor={"white"}
          logo={
            <Stack
              direction="row"
              spacing="12px"
              align="center"
              justify="center"
            >
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
        <Box mb={{ sm: "8px", md: "0px" }} className="bradcrub-navbar" >
          <Breadcrumb separator=">" style={{ color: "white" }}>
            {generateBreadcrumbs()}
          </Breadcrumb>
          <Link className="linksss"
            pt="20px"
            color={mainText}
            href="#"
            bg="inherit"
            borderRadius="inherit"
            fontWeight="bold"
            _hover={{ color: "white", borderBottom: "1px solid white" }}
            _active={{
              bg: "inherit",
              transform: "none",
              borderColor: "transparent",
            }}
            _focus={{
              boxShadow: "none",
            }}
          >
            {brandText}
          </Link>
        </Box>

        <Box ms="auto" w={{ sm: "100%", md: "unset" }}>
          <AdminNavbarLinks
            onOpen={props.onOpen}
            logoText={props.logoText}
            secondary={props.secondary}
            fixed={props.fixed}
            scrolled={scrolled}
          />
        </Box>
      </Flex>
    </Flex>
  );
}
