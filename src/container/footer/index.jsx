import { Col, Flex, Grid, Row, Typography } from "antd";
import gsap from "gsap";
import React from "react";
import TailSpin from "react-loading-icons/dist/esm/components/tail-spin";
import Polygon from "../../assets/coin_logo/Polygon_Icon.webp";
import logo from "../../assets/coin_logo/edu_coin.png";
import Ethereum from "../../assets/coin_logo/eth_coin.png";
import Loading from "../../component/loading-wrapper/secondary-loader";

import { CHAIN_POLYGON } from "../../utils/common";
import { propsContainer } from "../props-container";

const Footer = (props) => {
  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const breakpoints = useBreakpoint();
  const { reduxState } = props.redux;
  const constantState = reduxState.constant;
  const chain = reduxState.wallet.chain;

  let USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  gsap.to(".round", {
    rotation: 360,
    duration: 4,
    repeat: -1,
    repeatDelay: 10,
    ease: "none",
  });

  return (
    <>
      <Row justify={"space-around"} align={"middle"}>
        <Col>
          <Loading
            spin={!constantState.chainvalue}
            indicator={
              <TailSpin stroke="#6a85f1" alignmentBaseline="central" />
            }
          >
            {constantState.chainvalue ? (
              <Flex gap={5} align="center">
                <img
                  className="round"
                  src={chain === CHAIN_POLYGON ? Polygon : Ethereum}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={"25px"}
                  height={breakpoints.xs ? "25px" : ""}
                />
                <Text
                  className={`gradient-text-one ${
                    breakpoints.xs ? "font-xmsmall" : "font-small"
                  } heading-one`}
                >
                  {USDollar.format(constantState.chainvalue)}
                </Text>
              </Flex>
            ) : (
              ""
            )}
          </Loading>
        </Col>

        <Col>
          <Loading
            spin={!constantState.coinValue}
            indicator={
              <TailSpin stroke="#6a85f1" alignmentBaseline="central" />
            }
          >
            {constantState.coinValue ? (
              <Flex gap={5} align="center">
                <img
                  className="round"
                  src={logo}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={25}
                />
                <Text
                  className={`gradient-text-one ${
                    breakpoints.xs ? "font-xmsmall" : "font-small"
                  } heading-one`}
                >
                  {USDollar.format(constantState.coinValue)}
                </Text>
              </Flex>
            ) : (
              ""
            )}
          </Loading>
        </Col>
      </Row>
    </>
  );
};

export default propsContainer(Footer);
