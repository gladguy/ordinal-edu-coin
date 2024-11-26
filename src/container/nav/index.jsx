import {
  Col,
  ConfigProvider,
  Divider,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Menu,
  Modal,
  Radio,
  Row,
  Tabs,
  Tooltip,
  Tour,
  Typography,
} from "antd";
import { motion } from "framer-motion";
import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDisconnect } from "react-icons/ai";
import { PiCopyBold } from "react-icons/pi";
import { RiWallet3Fill } from "react-icons/ri";
import { RxHamburgerMenu } from "react-icons/rx";
import Web3 from "web3";
import Polygon from "../../assets/coin_logo/Polygon_Icon.webp";
import logo from "../../assets/coin_logo/edu_coin.png";
import Ethereum from "../../assets/coin_logo/eth_coin.png";
import myordinalslogo from "../../assets/logo/ordinalslogo.png";
import CustomButton from "../../component/Button";
import CardDisplay from "../../component/card";
import ModalDisplay from "../../component/modal";
import Notify from "../../component/notification";
import {
  clearStates,
  setLendHeader,
  setLoading,
  setUserCollateral,
} from "../../redux/slice/constant";
import {
  clearWalletState,
  setChain,
  setMetaCredentials,
} from "../../redux/slice/wallet";
import {
  Capitalaize,
  CHAIN_ETHEREUM,
  CHAIN_POLYGON,
  chainId,
  META_WALLET_KEY,
  openCampusNetworkMainnetParams,
  paymentWallets,
  sliceAddress,
} from "../../utils/common";
import { propsContainer } from "../props-container";
import { FaAngleDown } from "react-icons/fa";

const Nav = (props) => {
  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const breakPoint = useBreakpoint();

  const { location, navigate } = props.router;
  const { dispatch, reduxState } = props.redux;

  const walletState = reduxState.wallet;
  const activeWallet = reduxState.wallet.active;
  const chain = reduxState.wallet.chain;
  const metaAddress = walletState.meta.address;

  const [isConnectModal, setConnectModal] = useState(false);
  const [chainConnect, setChainConnect] = useState("");
  const [tabKey, setTabKey] = useState("1");
  const [open, setOpen] = useState(false);
  const [screenDimensions, setScreenDimensions] = React.useState({
    width: window.screen.width,
    height: window.screen.height,
  });
  const [current, setCurrent] = useState();

  const avatar = process.env.REACT_APP_AVATAR;

  const { confirm } = Modal;
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);

  const [openTour, setOpenTour] = useState(
    localStorage.getItem("isTourEnabled") ?? true
  );

  const tourSteps = [
    {
      title: (
        <Text strong style={{ color: "violet", fontSize: "20px" }}>
          Browse
        </Text>
      ),
      description:
        "In this you can veiw the approved collections and partners we have in group with us and we have a suprise page to view borrow and lend page.",
      target: () => ref1.current,
    },
    {
      title: (
        <Text strong style={{ color: "violet", fontSize: "20px" }}>
          Dashboard
        </Text>
      ),
      description:
        "In Dashboard page, we have the wallet supplies details, your asset supplies details, asset to supply details and we also have your lendings, asset to lend details.",
      target: () => ref2.current,
    },
    {
      title: (
        <Text strong style={{ color: "violet", fontSize: "20px" }}>
          Portfolio
        </Text>
      ),
      description:
        "In Portfolio page, we have the all the three wallet addresses plug wallet, unisat wallet and xverse wallet and we know what are the loan requests avaliable and we have details of our assets.",
      target: () => ref3.current,
    },
    {
      title: (
        <Text strong style={{ color: "violet", fontSize: "20px" }}>
          Connect Button
        </Text>
      ),
      description:
        "This button is used to connect the wallet. when you click the button modal opens with two tabs, in BTC tab we connect plug wallet and in ICP tab we connect unisat or xverse wallet",
      target: () => ref4.current,
    },
  ];

  const tourConfirm = () => {
    confirm({
      className: "backModel",
      title: (
        <Text style={{ color: "white", fontSize: "20px", marginTop: -30 }}>
          Tour Alert
        </Text>
      ),
      okText: "Yes",
      cancelText: "No",
      type: "error",
      okButtonProps: { htmlType: "submit" },
      content: (
        <>
          <Row>
            <Col>
              <Typography
                style={{ marginBottom: 5, color: "white", fontSize: "18px" }}
              >
                Are you sure want to cancel tour?
              </Typography>
            </Col>
          </Row>
        </>
      ),
      onOk() {
        localStorage.setItem("isTourEnabled", false);
        setOpenTour(localStorage.getItem("isTourEnabled"));
      },
    });
  };

  const getItem = (label, key, icon, children) => {
    return {
      key,
      icon,
      children,
      label,
    };
  };

  useEffect(() => {
    if (location.pathname === "/") {
      setCurrent("tmp-0");
    } else if (location.pathname === "/borrow") {
      setCurrent("tmp-1");
    } else if (location.pathname === "/lend") {
      setCurrent("tmp-2");
    }
    if (location.pathname === "/portfolio") {
      setCurrent("tmp-3");
    }
  }, [current, location.pathname]);

  const successMessageNotify = (message) => {
    Notify("success", message);
  };

  const collapseConnectedModal = () => {
    setConnectModal(!isConnectModal);
    setOpen(false);
  };

  const connectWallet = async () => {
    if (chainConnect) {
      // Meta wallet
      const web3 = new Web3(window.ethereum || window.web3.currentProvider);
      if (web3) {
        try {
          let isSwitched = false;
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          const networkId = await web3.eth.net.getId();

          if (Number(networkId) !== chainId) {
            Notify("info", "Switching to the EDU open campus network!");
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: openCampusNetworkMainnetParams.chainId }],
              });
              isSwitched = true;
            } catch (switchError) {
              if (switchError.code === 4902) {
                // This error code indicates that the chain has not been added to MetaMask.
                try {
                  await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [openCampusNetworkMainnetParams],
                  });
                  isSwitched = true;
                } catch (addError) {
                  console.error("Failed to add the network:", addError);
                }
              } else {
                console.error("Failed to switch the network:", switchError);
              }
            }
          } else {
            isSwitched = true;
          }
          if (isSwitched) {
            dispatch(
              setMetaCredentials({
                address: accounts[0],
                publicKey: null,
              })
            );
            Notify("success", "Wallet connection success!");
            dispatch(setChain(chainConnect));
            collapseConnectedModal();
          } else {
            Notify("error", "Wallet switching failed!");
          }
          dispatch(setLoading(false));
        } catch (error) {
          console.error("User denied account access", error);
        }
      } else {
        Notify(
          "warning",
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }
    } else {
      Notify("warning", "Choose the network!");
    }
  };

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const walletCards = (wallet, index) => (
    <CardDisplay
      key={`${wallet.label}-${index + 1 * 123}`}
      className={`modalCardBg card-hover width pointer grey-bg m-top-bottom`}
      hoverable={true}
      onClick={() => {
        connectWallet(wallet.key);
      }}
    >
      <Row align={"middle"}>
        <img
          src={wallet.image}
          alt={`${wallet.key}_logo`}
          style={{
            marginRight: wallet.key === "xverse" ? "20px" : "10px",
          }}
          width={wallet.key === "xverse" ? "7%" : "10%"}
        />{" "}
        <h2
          style={{ margin: "0" }}
          className="white-color font-courier font-large letter-spacing-medium"
          level={2}
        >
          {wallet.label}
        </h2>
      </Row>
    </CardDisplay>
  );

  const getScreenDimensions = (e) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setScreenDimensions({ width, height });
  };

  useEffect(() => {
    window.addEventListener("resize", getScreenDimensions);
    return () => {
      window.removeEventListener("resize", getScreenDimensions);
    };
  }, []);

  const onClick = (e) => {
    setCurrent(e.key);
  };

  const options = [
    getItem(
      <Row
        className="font-style"
        onClick={() => {
          navigate("/");
          setOpen(false);
        }}
      >
        Browse
      </Row>
    ),
    getItem(
      <Row
        className="font-style"
        onClick={() => {
          navigate("/lending");
          setOpen(false);
        }}
      >
        Lending
      </Row>
    ),
    getItem(
      <Row
        className="font-style"
        onClick={() => {
          navigate("/borrowing");
          setOpen(false);
        }}
      >
        Borrowing
      </Row>
    ),
    getItem(
      <Row
        className="font-style "
        onClick={() => {
          navigate("/bridge");
          setOpen(false);
        }}
      >
        Bridge Ordinals
      </Row>
    ),
    getItem(
      <Row
        className="font-style"
        onClick={() => {
          navigate("/portfolio");
          setOpen(false);
        }}
      >
        Portfolio
      </Row>
    ),
  ];

  const addressRendererWithCopy = (address) => {
    return (
      <Tooltip arrow title={"Copied"} trigger={"click"} placement="top">
        <PiCopyBold
          className="pointer"
          onClick={() => {
            navigator.clipboard.writeText(address);
          }}
          size={15}
        />
      </Tooltip>
    );
  };

  const avatarRenderer = (width) => (
    <img
      src={`${avatar}/svg?seed=${metaAddress}`}
      width={width}
      className="avatar"
      alt="avatar"
    />
  );
  gsap.to(".round", {
    rotation: 360,
    duration: 4,
    repeat: -1,
    repeatDelay: 10,
    ease: "none",
  });

  return (
    <>
      <Row
        justify={{
          xs: "space-between",
          lg: "space-between",
          xl: "space-between",
        }}
        className="mt-2"
        align={"middle"}
      >
        <Col>
          <Row align={"middle"}>
            <Col>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ rotate: 360, scale: 1, opacity: 1 }}
                whileHover={{
                  scale: 0.8,
                  rotate: -45,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.5,
                }}
              >
                <img
                  src={myordinalslogo}
                  alt="logo"
                  className="pointer"
                  width={65}
                  onClick={() => {
                    navigate("/");
                    dispatch(setLendHeader(false));
                  }}
                />
              </motion.div>
            </Col>
          </Row>
        </Col>

        <Col>
          {screenDimensions.width >= 1200 && (
            <>
              <Flex gap={50}>
                <Text
                  className={`${
                    location.pathname === "/"
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one `}
                  onClick={() => {
                    navigate("/");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref1}
                >
                  Browse
                </Text>
                <Text className="font-xsmall color-grey">|</Text>
                <Text
                  className={`${
                    location.pathname === "/lending"
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one `}
                  onClick={() => {
                    navigate("/lending");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref2}
                >
                  Lending
                </Text>
                <Text className="font-xsmall color-grey">|</Text>

                <Text
                  className={`${
                    location.pathname === "/borrowing"
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one `}
                  onClick={() => {
                    navigate("/borrowing");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref2}
                >
                  Borrowing
                </Text>

                <Text className="font-xsmall color-grey">|</Text>

                <Text
                  className={`${
                    location.pathname === "/bridge"
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one `}
                  onClick={() => {
                    navigate("/bridge");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref3}
                >
                  DBridge
                </Text>
                <Text className="font-xsmall color-grey">|</Text>
                <Text
                  className={`${
                    location.pathname.includes("portfolio")
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one  `}
                  onClick={() => {
                    navigate("/portfolio");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref5}
                >
                  Portfolio
                </Text>

                <Text className="font-xsmall color-grey">|</Text>

                <Text
                  className={`${
                    location.pathname === "/activeloans"
                      ? "headertitle headerStyle"
                      : "font-style headerCompanyName"
                  } pointer heading-one `}
                  onClick={() => {
                    navigate("/activeloans");
                    dispatch(setLendHeader(false));
                  }}
                  ref={ref6}
                >
                  Active Loans
                </Text>
              </Flex>
            </>
          )}
        </Col>

        <Col>
          <Flex gap={10} justify="end" align={"center"} ref={ref4}>
            <Dropdown
              className="pointer"
              menu={{
                items: [
                  {
                    label: (
                      <Text
                        className={`${
                          breakPoint.xs ? "font-xsmall" : "font-small"
                        } text-color-one biticon`}
                      >
                        {Capitalaize(
                          chain === CHAIN_POLYGON
                            ? CHAIN_ETHEREUM
                            : CHAIN_POLYGON
                        )}
                      </Text>
                    ),
                    key: "0",
                    onClick: () => {
                      dispatch(
                        setChain(
                          chain === CHAIN_POLYGON
                            ? CHAIN_ETHEREUM
                            : CHAIN_POLYGON
                        )
                      );
                      onClose();
                      setTimeout(() => {
                        window.location.reload();
                      }, 1500);
                    },
                    icon: (
                      <img
                        src={chain === CHAIN_POLYGON ? Ethereum : Polygon}
                        alt="noimage"
                        style={{
                          justifyContent: "center",
                          marginRight: "17px",
                        }}
                        width={"25px"}
                      />
                    ),
                  },
                ],
              }}
              trigger={["click"]}
            >
              <Text
                className={`${
                  breakPoint.xs ? "font-medium" : "font-large"
                } gradient-text-one biticon heading-one`}
              >
                {/* {chain.toUpperCase()} */}
                <img
                  src={chain === CHAIN_POLYGON ? Polygon : Ethereum}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={"35px"}
                />
                <FaAngleDown color="white" />
              </Text>
            </Dropdown>
          </Flex>
        </Col>

        <Col>
          <Flex gap={10} justify="end" align={"center"} ref={ref4}>
            {activeWallet.length ? (
              <Col>
                <Flex
                  gap={5}
                  align="center"
                  className="pointer"
                  onClick={showDrawer}
                  justify="space-evenly"
                >
                  {screenDimensions.width > 767 ? (
                    <>{avatarRenderer(45)}</>
                  ) : (
                    <label class="hamburger">
                      <input type="checkbox" checked={open} />
                      <svg viewBox="0 0 32 32">
                        <path
                          class="line line-top-bottom"
                          d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                        ></path>
                        <path class="line" d="M7 16 27 16"></path>
                      </svg>
                    </label>
                  )}
                </Flex>
              </Col>
            ) : (
              <Col>
                {!breakPoint.xs ? (
                  <Row justify={"end"}>
                    <CustomButton
                      className="click-btn font-weight-600 letter-spacing-small"
                      // old btn style
                      // className="button-css lend-button"
                      title={"Connect"}
                      onClick={() => {
                        if (walletState.active.length < 2) {
                          collapseConnectedModal();
                        } else {
                          successMessageNotify("Wallet already connected!");
                        }
                      }}
                    />
                  </Row>
                ) : (
                  <RxHamburgerMenu
                    color="violet"
                    size={25}
                    onClick={showDrawer}
                  />
                )}
              </Col>
            )}
          </Flex>
        </Col>
      </Row>

      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "green",
          },
        }}
      >
        <Tour
          scrollIntoViewOptions={true}
          open={openTour === "false" ? false : true}
          zIndex={1}
          animated
          onClose={(location) => {
            if (location === 3) {
              localStorage.setItem("isTourEnabled", false);
              setOpenTour(localStorage.getItem("isTourEnabled"));
            } else {
              tourConfirm();
            }
          }}
          steps={tourSteps}
          indicatorsRender={(current, total) => (
            <span>
              {current + 1} / {total}
            </span>
          )}
        />
      </ConfigProvider>

      <ModalDisplay
        open={isConnectModal}
        footer={""}
        onCancel={() => {
          collapseConnectedModal();
          setChainConnect("");
        }}
        width={breakPoint.xs ? "100%" : "30%"}
      >
        <Row justify={"start"} align={"middle"}>
          <Text
            className={`${
              breakPoint.xs ? "font-medium" : "font-large"
            } gradient-text-one biticon heading-one`}
          >
            <RiWallet3Fill
              color="#55AD9B"
              size={breakPoint.xs ? 27 : 35}
              className="border-radius-5"
            />{" "}
            Connect Wallet{" "}
          </Text>
        </Row>

        <Row justify={"start"} align={"middle"}>
          <Text className={`font-small text-color-two biticon mt-15`}>
            Connect the Meta wallet for payments, lending and borrowing.
          </Text>
        </Row>

        <Row justify={"center"}>
          <Divider />
        </Row>

        <Row>
          <Col xs={24}>
            <Row>
              <Text className="font-weight-600 letter-spacing-small text-color-primary font-small">
                {" "}
                Select Chain
              </Text>
            </Row>
            <Row className="mt-15" align={"middle"}>
              <Radio.Group
                className="radio-css"
                size="large"
                buttonStyle="solid"
                optionType="button"
                value={chainConnect}
                onChange={({ target: { value } }) => {
                  setChainConnect(value);
                }}
                options={[
                  {
                    label: "Polygon",
                    value: CHAIN_POLYGON,
                  },
                  {
                    label: "Ethereum",
                    value: CHAIN_ETHEREUM,
                  },
                ]}
              />
            </Row>

            <Tabs
              activeKey={tabKey}
              className="mt-15"
              onChange={(e) => {
                setTabKey(e);
              }}
              items={[
                {
                  key: "1",
                  label: (
                    <Row align={"middle"}>
                      <img
                        src={logo}
                        alt="noimage"
                        style={{ paddingRight: "10px" }}
                        width={25}
                      />
                      <Text className="font-weight-600 letter-spacing-medium text-color-one font-large">
                        {" "}
                        OPEN CAMPUS
                      </Text>
                    </Row>
                  ),
                  children: (
                    <>
                      <Row>
                        {paymentWallets.map((wallet, index) => {
                          return (
                            <Row key={`index-${wallet.key}`}>
                              {walletCards(wallet, index)}
                            </Row>
                          );
                        })}
                      </Row>
                    </>
                  ),
                },
              ]}
            />
          </Col>
        </Row>
      </ModalDisplay>

      <Drawer
        closeIcon
        width={screenDimensions.width > 425 ? "320px" : "280px"}
        style={{ height: screenDimensions.width > 1199 ? "45%" : "100%" }}
        title={
          <>
            <Row justify={"space-evenly"} align={"middle"}>
              <Flex gap={10} align="center">
                {avatarRenderer(45)}
                <Text className="text-color-one">
                  {metaAddress ? <>{sliceAddress(metaAddress, 5)}</> : ""}
                </Text>
              </Flex>
            </Row>
            <Row justify={"center"}>
              <Divider />
            </Row>
          </>
        }
        placement="right"
        closable={false}
        onClose={onClose}
        open={open}
        footer={
          <>
            {screenDimensions.width > 1199 && (
              <Row justify={"end"} className="iconalignment pointer">
                <CustomButton
                  className={"click-btn font-weight-600 letter-spacing-small"}
                  onClick={async () => {
                    dispatch(clearStates());
                    dispatch(setUserCollateral(null));
                    successMessageNotify("Your are signed out!");
                    dispatch(clearWalletState());
                    onClose();
                  }}
                  title={
                    <Flex align="center" justify="center" gap={3}>
                      <AiOutlineDisconnect
                        color="white"
                        style={{ fill: "chocolate" }}
                        size={25}
                      />
                      <Text className="text-color-one font-small heading-one">
                        Disconnect
                      </Text>
                    </Flex>
                  }
                  block
                  size="medium"
                />
              </Row>
            )}
          </>
        }
      >
        {/* Drawer Renderer */}
        <>
          <Row justify={"space-between"} align={"middle"}>
            <Col>
              <Flex align="center">
                <img
                  src={logo}
                  alt="logo"
                  style={{ marginRight: "20px" }}
                  width={25}
                />
                <Flex vertical>
                  <Text className="text-color-two font-medium">Payments</Text>
                  <Text className="text-color-one font-xsmall">
                    {metaAddress ? (
                      <>
                        {sliceAddress(metaAddress, 9)}{" "}
                        {addressRendererWithCopy(metaAddress)}
                      </>
                    ) : (
                      "---"
                    )}
                  </Text>
                </Flex>
              </Flex>
            </Col>

            <Col className="mt-15">
              <Flex gap={10} justify="end" align={"center"} ref={ref4}>
                <img
                  src={chain === CHAIN_POLYGON ? Polygon : Ethereum}
                  alt="noimage"
                  style={{ justifyContent: "center", marginRight: "17px" }}
                  width={"25px"}
                />

                <Flex vertical>
                  <Text className="text-color-two font-medium">Chain</Text>
                  <Text
                    className={`${
                      breakPoint.xs ? "font-medium" : "font-large"
                    } gradient-text-one biticon heading-one`}
                  >
                    {Capitalaize(chain)}
                  </Text>
                </Flex>
              </Flex>
            </Col>

            <Col>
              {walletState.active.includes(META_WALLET_KEY) ? null : (
                <CustomButton
                  className="font-size-18 black-bg text-color-one border-none"
                  title={"Connect"}
                  onClick={() => {
                    if (walletState.active.length < 2) {
                      collapseConnectedModal();
                    } else {
                      successMessageNotify("Wallet already connected!");
                    }
                  }}
                />
              )}
            </Col>
          </Row>

          {screenDimensions.width < 1200 && (
            <>
              <Row
                style={{ marginTop: "10px" }}
                justify={{
                  xs: "center",
                  sm: "center",
                  md: "end",
                  lg: "end",
                  xl: "end",
                }}
                className="iconalignment pointer"
              >
                <CustomButton
                  className={"click-btn font-weight-600 letter-spacing-small"}
                  onClick={async () => {
                    dispatch(clearStates());
                    dispatch(setUserCollateral(null));
                    successMessageNotify("Your are signed out!");
                    dispatch(clearWalletState());
                    onClose();
                  }}
                  title={
                    <>
                      <AiOutlineDisconnect
                        color="white"
                        style={{ fill: "chocolate" }}
                        size={25}
                      />
                      <Text className="text-color-two font-small heading-one">
                        Disconnect
                      </Text>
                    </>
                  }
                  block
                  size="medium"
                />
              </Row>
              <Row justify={"center"}>
                <Divider />
              </Row>
              <Menu
                onClick={onClick}
                style={{ width: screenDimensions.width > 425 ? 270 : 230 }}
                defaultOpenKeys={["sub1"]}
                selectedKeys={[current]}
                mode="inline"
                items={options}
              />
              {/* {screenDimensions.width < 992 && (
                <Row style={{ padding: " 0px 24px", marginTop: "10px" }}>
                  <Col>
                    <Loading
                      spin={!constantState.ethvalue}
                      indicator={
                        <TailSpin
                          stroke="#6a85f1"
                          alignmentBaseline="central"
                        />
                      }
                    >
                      {constantState.ethvalue ? (
                        <Flex gap={5}>
                          <Text className="gradient-text-one font-small heading-one">
                            BTC
                          </Text>
                          <img
                            src={Bitcoin}
                            alt="noimage"
                            style={{ justifyContent: "center" }}
                            width="35dvw"
                          />{" "}
                          <Text className="gradient-text-one font-small heading-one">
                            $ {constantState.ethvalue}
                          </Text>
                        </Flex>
                      ) : (
                        ""
                      )}
                    </Loading>
                  </Col>
                </Row>
              )} */}
            </>
          )}
        </>
        {/* Drawer renderer ended */}
      </Drawer>
    </>
  );
};

export default propsContainer(Nav);
