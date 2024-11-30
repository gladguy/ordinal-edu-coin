import {
  Col,
  Divider,
  Flex,
  Grid,
  Layout,
  Row,
  Tooltip,
  Typography,
} from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import gsap from "gsap";
import React, { Suspense } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LoadingWrapper from "../../component/loading-wrapper";
import Mainheader from "../../container/footer";
import logo from "../../assets/logo/ordinalslogo.png";
import Nav from "../../container/nav";
import { publicRoutes } from "../../routes";
import { FaXTwitter } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";

const MainLayout = () => {
  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  gsap.to(".round", {
    rotation: 360,
    duration: 4,
    repeat: -1,
    repeatDelay: 10,
    ease: "none",
  });
  gsap.fromTo(
    ".slide",
    { autoAlpha: 0, backgroundColor: "red" },
    { autoAlpha: 1, duration: 0.5, backgroundColor: "red" }
  );

  return (
    <React.Fragment>
      <Header className="header-sticky z-index">
        <Row justify={"center"}>
          <Col xs={23}>
            <Nav />
          </Col>
        </Row>
      </Header>
      <Layout>
        <Layout className="slide" style={{ backgroundColor: "black" }}>
          {/* Don't touch content minHeight */}
          <Content
            className={location.pathname !== "/" ? "theme-bg" : ""}
            style={{ minHeight: "85.60vh" }}
          >
            <Row justify={"center"} className="blurEffect">
              <Col xs={23} md={21}>
                <Routes>
                  {publicRoutes.map((route, index) => {
                    let Component = route.component;
                    return (
                      <Route
                        key={`route-${index}`}
                        path={route.path}
                        element={
                          <Suspense
                            fallback={
                              <LoadingWrapper>Loading...</LoadingWrapper>
                            }
                          >
                            <Component />
                          </Suspense>
                        }
                      />
                    );
                  })}
                </Routes>
              </Col>
            </Row>
          </Content>

          <Flex vertical>
            {location.pathname === "/" ? (
              <>
                <Footer className="bg-black" style={{ padding: "20px" }}>
                  <Row
                    justify={"center"}
                    className={screens.md ? "mt-50" : "mt-15"}
                    style={{ paddingBottom: "50px" }}
                  >
                    <Col md={22}>
                      <Row
                        justify={{ md: "space-between", xs: "center" }}
                        align={"middle"}
                        style={{
                          alignItems: "center",
                        }}
                      >
                        <Col
                          xs={{ order: "2", span: 24 }}
                          md={{ order: "1" }}
                          lg={{ span: 8 }}
                          className={
                            screens.md || screens.sm || screens.xs ? "mt-7" : ""
                          }
                        >
                          <Flex
                            justify="center"
                            align={
                              screens.md || screens.sm || screens.xs
                                ? "center"
                                : ""
                            }
                            vertical
                          >
                            <img
                              src={logo}
                              alt="logo"
                              className="pointer"
                              width={150}
                            />
                            <Text
                              className={`gradient-text-one ${
                                screens.xs ? "font-xssmall" : "font-medium"
                              } font-family-one letter-spacing-small`}
                            >
                              OpenCampus
                            </Text>
                            <Text
                              className={`gradient-text-one ${
                                screens.xs ? "font-xssmall" : "font-small"
                              } font-family-one letter-spacing-small`}
                            >
                              {`All rights reserved Copyright - ${new Date().getFullYear()}`}
                            </Text>
                          </Flex>
                        </Col>

                        <Col
                          xs={{ span: 24, order: "1" }}
                          md={{ order: "2" }}
                          sm={24}
                          lg={{ span: 10 }}
                          className={
                            screens.md || screens.sm || screens.xs
                              ? "mt-15"
                              : ""
                          }
                        >
                          <Flex vertical gap={15}>
                            {screens.md && (
                              <Col>
                                <Flex vertical gap={15} wrap="wrap">
                                  <Flex justify="space-between" wrap="wrap">
                                    <Text
                                      onClick={() => {
                                        navigate("/lending");
                                        window.scrollTo(0, 0);
                                      }}
                                      className="text-color-two headertitle title pointer font-small letter-spacing-small"
                                    >
                                      Lending
                                    </Text>
                                    <Text
                                      onClick={() => {
                                        navigate("/borrowing");
                                        window.scrollTo(0, 0);
                                      }}
                                      className="text-color-two headertitle title pointer font-small letter-spacing-small"
                                    >
                                      Borrowing
                                    </Text>
                                    <Text
                                      onClick={() => {
                                        navigate("/bridge");
                                        window.scrollTo(0, 0);
                                      }}
                                      className="text-color-two headertitle title pointer font-small letter-spacing-small"
                                    >
                                      DBridge
                                    </Text>
                                  </Flex>
                                </Flex>
                              </Col>
                            )}

                            {!screens.xs ? (
                              <Row justify={"center"}>
                                <Divider style={{ margin: 0 }} />
                              </Row>
                            ) : (
                              ""
                            )}

                            {screens.xs && (
                              <Row
                                justify={"center"}
                                style={{ marginTop: screens.xs && "-15px" }}
                              >
                                <Text className="text-color-one dash-headings letter-spacing-medium font-xxlarge font-weight-600">
                                  Follow us on
                                </Text>
                              </Row>
                            )}

                            <Flex
                              gap={50}
                              justify="start"
                              className={screens.xs && "mt-15"}
                            >
                              <Tooltip
                                arrow
                                title={"myordinalsloan@gmail.com"}
                                trigger={"hover"}
                              >
                                <Text className="font-xlarge">
                                  <a href={"quicknftloan@gmail.com"}>
                                    {" "}
                                    <IoIosMail
                                      color="#ebe6c8"
                                      className="pointer homepageicon"
                                      size={40}
                                    />
                                  </a>
                                </Text>
                              </Tooltip>

                              <Link
                                target={"_blank"}
                                to={"https://x.com/QuickNFTLoan"}
                              >
                                <Text className="font-xlarge pointer">
                                  <FaXTwitter
                                    color="#ebe6c8"
                                    className="homepageicon"
                                    size={35}
                                  />
                                </Text>
                              </Link>
                            </Flex>

                            {screens.xs ? (
                              <Row justify={"center"}>
                                <Divider style={{ margin: 0 }} />
                              </Row>
                            ) : (
                              ""
                            )}
                          </Flex>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Footer>
              </>
            ) : null}

            <div className="value-header">
              <Header className="header z-index">
                <Row justify={"center"}>
                  <Col xs={21}>
                    <Mainheader />
                  </Col>
                </Row>
              </Header>
            </div>
          </Flex>
        </Layout>
      </Layout>
    </React.Fragment>
  );
};

export default MainLayout;
