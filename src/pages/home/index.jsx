import { Col, Flex, Grid, Row, Tooltip, Typography } from "antd";
import { motion } from "framer-motion";
import gsap from "gsap";
import React, { useEffect, useState } from "react";
import { SpinningCircles } from "react-loading-icons";
import logo from "../../assets/coin_logo/edu_coin.png";
import CardDisplay from "../../component/card";
import { propsContainer } from "../../container/props-container";
import {
  calculateOrdinalInCrypto,
  Capitalaize,
  CHAIN_ETHEREUM,
  formatNumber,
} from "../../utils/common";

const Home = (props) => {
  const { reduxState } = props.redux;
  const collections = reduxState.constant.approvedCollections;
  const coinValue = reduxState.constant.coinValue;
  const chainvalue = reduxState.constant.chainvalue;
  const chain = reduxState.wallet.chain;

  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const breakpoints = useBreakpoint();

  const [collectionList, setCollectionList] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const container = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 1.5,
        staggerChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delayChildren: 1.5,
        staggerChildren: 5.3,
      },
    },
  };

  gsap.to(".box", {
    y: 10,
    stagger: {
      // wrap advanced options in an object
      each: 0.1,
      from: "center",
      grid: "auto",
      ease: "power2.inOut",
      repeat: 1, // Repeats immediately, not waiting for the other staggered animations to finish
    },
  });

  useEffect(() => {
    if (collections[0]) {
      setIsFetching(false);
      setCollectionList(collections.slice(0, 9));
    } else {
      setIsFetching(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections]);

  return (
    <React.Fragment>
      {/* Collections */}
      <Row>
        <Col>
          <h1 className="text-color-four letter-spacing-small">
            {Capitalaize(chain || CHAIN_ETHEREUM)} NFT Collections
          </h1>
        </Col>
      </Row>

      <motion.ul
        className="container"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <Row justify={"start"} gutter={32}>
          {collectionList?.map((collection, index) => {
            const name = collection?.name;
            const nameSplitted = collection?.name?.split(" ");
            let modifiedName = "";
            nameSplitted?.forEach((word) => {
              if ((modifiedName + word).length < 25) {
                modifiedName = modifiedName + " " + word;
              }
            });
            const floor = collection?.floorAsk?.price?.amount?.decimal
              ? calculateOrdinalInCrypto(
                  collection?.floorAsk?.price?.amount?.decimal,
                  chainvalue,
                  coinValue
                )
              : 0;

            const volume = collection?.volume?.allTime
              ? (collection?.volume?.allTime * chainvalue) / coinValue
              : 0;

            const formatedVolume = formatNumber(volume);

            return (
              <Col
                key={`${collection?.id}-${index}`}
                lg={8}
                md={12}
                sm={12}
                xs={24}
              >
                <CardDisplay
                  className={
                    "main-bg dashboard-card-padding m-top-bottom dashboard-cards pointer box collection-bg"
                  }
                >
                  <Row justify={"center"}>
                    <Col>
                      <motion.li variants={item}>
                        <div
                          style={{ display: "grid", placeContent: "center" }}
                        >
                          {name?.length > 35 ? (
                            <Tooltip arrow title={name}>
                              <Text className="heading-one text-color-four font-medium">
                                {`${modifiedName}...`}
                              </Text>
                            </Tooltip>
                          ) : (
                            <Text className="heading-one font-medium text-color-four">
                              {modifiedName}
                            </Text>
                          )}
                        </div>
                      </motion.li>
                    </Col>
                  </Row>
                  <Row
                    justify={{ xs: "space-between", md: "center" }}
                    align={"middle"}
                    className={breakpoints.xs || breakpoints.md ? "mt-5" : ""}
                    gutter={breakpoints.xs || breakpoints.md ? [0, 12] : []}
                  >
                    <Col xs={24} md={24} lg={5} xl={5}>
                      <motion.li variants={item}>
                        <Row justify={"center"}>
                          <img
                            className="border-radius-5 loan-cards"
                            width={"90px"}
                            height={"75dvw"}
                            alt={name}
                            src={collection?.image}
                            onError={(e) =>
                              (e.target.src = `https://i.seadn.io/s/raw/files/b1ee9db8f2a902b373d189f2c279d81d.png?w=500&auto=format`)
                            }
                          />
                        </Row>
                      </motion.li>
                    </Col>

                    <Col xs={24} sm={20} md={20} lg={18} xl={18}>
                      <motion.li variants={item}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "auto auto",
                            gridAutoFlow: "row",
                            gridColumnGap: "10px",
                            placeContent: "center",
                          }}
                        >
                          <div>
                            <Text className="font-medium text-color-two">
                              Floor
                            </Text>
                          </div>

                          <div>
                            <Flex
                              gap={3}
                              align="center"
                              className="font-medium text-color-two"
                            >
                              <img src={logo} alt="noimage" width={20} />
                              {floor ? floor.ordinalIncrypto : "-"}
                            </Flex>
                          </div>

                          <div>
                            <Text className="font-medium text-color-two">
                              Volume
                            </Text>
                          </div>

                          <div>
                            <Flex
                              gap={3}
                              align="center"
                              className="font-medium text-color-two"
                            >
                              <img
                                src={logo}
                                alt="noimage"
                                width={20}
                                height={20}
                              />
                              {formatedVolume}
                            </Flex>
                          </div>
                        </div>
                      </motion.li>
                    </Col>
                  </Row>
                </CardDisplay>
              </Col>
            );
          })}
        </Row>
      </motion.ul>

      {collections.length > 9 ? (
        <Row
          justify={"center"}
          className="m-bottom"
          style={{ marginBottom: 50 }}
        >
          <Col>
            <Text
              className="font-large pointer text-color-four"
              onClick={() =>
                setCollectionList(
                  collectionList.length > 10
                    ? collections.slice(0, 9)
                    : collections
                )
              }
            >
              {isFetching ? (
                <SpinningCircles />
              ) : collectionList.length > 10 ? (
                "Hide"
              ) : (
                "View all"
              )}
            </Text>
          </Col>
        </Row>
      ) : (
        ""
      )}
    </React.Fragment>
  );
};

export default propsContainer(Home);
