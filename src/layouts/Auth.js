import { Box } from "@chakra-ui/react";
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import routes from "routes.js";

export default function Pages(props) {
  const { ...rest } = props;
  const wrapper = React.createRef();
  React.useEffect(() => {
    document.body.style.overflow = "unset";
    return function cleanup() {};
  });
  const getActiveRoute = (routes) => {
    let activeRoute = "Default Brand Text";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].views);
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };
  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].views);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          if (routes[i].secondaryNavbar) {
            return routes[i].secondaryNavbar;
          }
        }
      }
    }
    return activeNavbar;
  };
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (prop.category === "account") {
        return getRoutes(prop.views);
      }
      if (prop.layout === "/auth") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  const navRef = React.useRef();
  document.documentElement.dir = "ltr";
  return (
    <Box ref={navRef} w="100%">
      {/* <Portal containerRef={navRef}>
        <AuthNavbar secondary={getActiveNavbar(routes)} logoText='' />
      </Portal> */}
      <Box w="100%">
        <Box ref={wrapper} w="100%">
          <Switch>
            {getRoutes(routes)}
            <Redirect from="/auth" to="/auth/signin" />
          </Switch>
        </Box>
      </Box>
    </Box>
  );
}
