import { Col, Collapse, Divider, Flex, Grid, Row, Typography } from "antd";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { TbInfoSquareRounded } from "react-icons/tb";
import { useSelector } from "react-redux";
import Bitcoin from "../../assets/coin_logo/edu_coin.png";
import borrowJson from "../../utils/borrow_abi.json";
import {
  BorrowContractAddress,
  TokenContractAddress,
} from "../../utils/common";
import tokensJson from "../../utils/tokens_abi.json";
import CustomButton from "../Button";
import ModalDisplay from "../modal";
import Notify from "../notification";
import { Link } from "react-router-dom";

const LendModal = ({
  modalState,
  lendModalData,
  toggleLendModal,
  setLendModalData,
  collapseActiveKey,
  getAllBorrowRequests,
  setCollapseActiveKey,
}) => {
  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const reduxState = useSelector((state) => state);
  const coinValue = reduxState.constant.coinValue;

  const activeWallet = reduxState.wallet.active;

  const ETH_ZERO = process.env.REACT_APP_ETH_ZERO;

  const [isOfferBtnLoading, setIsOfferBtnLoading] = useState(false);

  const handleAcceptRequest = async () => {
    try {
      setIsOfferBtnLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokensContract = new ethers.Contract(
        TokenContractAddress,
        tokensJson,
        signer
      );

      const borrowContract = new ethers.Contract(
        BorrowContractAddress,
        borrowJson,
        signer
      );

      const isApproved = await tokensContract.isApprovedForAll(
        lendModalData.borrower,
        BorrowContractAddress
      );

      if (!isApproved) {
        Notify("warning", "Borrower not approved!");
        setIsOfferBtnLoading(false);
        return;
      }

      const requestId = Number(lendModalData.requestId);
      const loanAmount = Number(lendModalData.loanAmount);

      const acceptLoan = await borrowContract.acceptBorrowRequest(requestId, {
        value: loanAmount.toString(),
      });

      await acceptLoan.wait();

      if (acceptLoan.hash) {
        Notify("success", "Lending success");
        await getAllBorrowRequests();
        toggleLendModal();
      }

      setIsOfferBtnLoading(false);
    } catch (error) {
      setIsOfferBtnLoading(false);

      if (error.message.includes("Loan amount does not match")) {
        Notify("warning", "Loan amount does not match");
      } else if (error.message.includes("This borrow request is not active")) {
        Notify("warning", "This borrow request is not active");
      } else if (error.message.includes("Borrower does not own this NFT")) {
        Notify("warning", "Borrower does not own this NFT");
      } else if (error.data.message.includes("insufficient funds for gas")) {
        Notify("warning", "Insufficient funds for gas");
      }
    }
  };

  return (
    <ModalDisplay
      footer={null}
      title={
        <Flex align="center" gap={5} justify="start">
          <Text className={`font-size-20 text-color-one letter-spacing-small`}>
            {lendModalData?.collectionName}{" "}
            <Link
              target="_blank"
              to={`https://opensea.io/assets/matic/${
                lendModalData?.id
              }/${Number(lendModalData?.tokenId)}`}
            >
              #{Number(lendModalData?.tokenId)}
            </Link>
          </Text>
        </Flex>
      }
      open={modalState}
      onCancel={toggleLendModal}
      width={screens.xl ? "35%" : screens.lg ? "50%" : "100%"}
    >
      {/* Lend Image Display */}
      <Row justify={"space-between"} className="mt-30">
        <Col md={4}>
          <img
            width={70}
            alt="withdraw_img"
            src={lendModalData.thumbnailURI}
            className="border-radius-8"
            onError={(e) =>
              (e.target.src = `https://i.seadn.io/s/raw/files/b1ee9db8f2a902b373d189f2c279d81d.png?w=500&auto=format`)
            }
          />
        </Col>

        <Col md={5}>
          <Flex
            vertical
            justify="center"
            align="center"
            className={`border border-radius-8 pointer`}
          >
            <Text className={`font-small text-color-one letter-spacing-small`}>
              Floor
            </Text>
            <Text
              className={`font-size-16 text-color-two letter-spacing-small`}
            >
              {Number(lendModalData.floorPrice)}
            </Text>
          </Flex>
        </Col>

        <Col md={5}>
          <Flex
            vertical
            justify="center"
            align="center"
            className={`border border-radius-8 pointer`}
          >
            <Text className={`font-small text-color-one letter-spacing-small`}>
              Term
            </Text>
            <Text
              className={`font-size-16 text-color-two letter-spacing-small`}
            >
              {Number(lendModalData.duration)} Days
            </Text>
          </Flex>
        </Col>

        <Col md={5}>
          <Flex
            vertical
            justify="center"
            align="center"
            className={`border border-radius-8 pointer`}
          >
            <Text className={`font-small text-color-one letter-spacing-small`}>
              LTV
            </Text>
            <Text
              className={`font-size-16 text-color-two letter-spacing-small`}
            >
              {lendModalData?.LTV}%
            </Text>
          </Flex>
        </Col>
      </Row>

      {/* Borrow Divider */}
      <Row justify={"center"}>
        <Divider />
      </Row>

      {/* Lend Offer Summary */}
      <Row className="mt-15">
        <Col md={24} className="collapse-antd">
          <Collapse
            className="border"
            size="small"
            ghost
            expandIcon={({ isActive }) => (
              <FaCaretDown
                color={isActive ? "white" : "#55AD9B"}
                size={25}
                style={{
                  transform: isActive ? "" : "rotate(-90deg)",
                  transition: "0.5s ease",
                }}
              />
            )}
            defaultActiveKey={["1"]}
            activeKey={collapseActiveKey}
            onChange={() => {
              if (collapseActiveKey[0] === "1") {
                setCollapseActiveKey(["2"]);
              } else {
                setCollapseActiveKey(["1"]);
              }
            }}
            items={[
              {
                key: "1",
                label: (
                  <Text
                    className={`font-small text-color-one letter-spacing-small`}
                  >
                    Accept Summary
                  </Text>
                ),
                children: (
                  <>
                    <Row justify={"space-between"}>
                      <Col>
                        <Text
                          className={`font-size-16 text-color-one letter-spacing-small`}
                        >
                          Loan amount
                        </Text>
                      </Col>
                      <Col>
                        <Flex align="center" gap={10}>
                          <Text
                            className={`card-box border text-color-two padding-small-box padding-small-box font-xsmall`}
                          >
                            ${" "}
                            {(
                              (Number(lendModalData.loanAmount) / ETH_ZERO) *
                              coinValue
                            ).toFixed(4)}
                          </Text>

                          <Text
                            className={`font-size-16 text-color-one letter-spacing-small`}
                          >
                            ~{" "}
                            {(
                              Number(lendModalData.loanAmount) / ETH_ZERO
                            ).toFixed(4)}
                          </Text>
                          <img
                            src={Bitcoin}
                            alt="noimage"
                            style={{ justifyContent: "center" }}
                            width={25}
                          />
                        </Flex>
                      </Col>
                    </Row>

                    <Row justify={"space-between"} className="mt-7">
                      <Col>
                        <Text
                          className={`font-size-16 text-color-one letter-spacing-small`}
                        >
                          Interest
                        </Text>
                      </Col>
                      <Col>
                        <Flex align="center" gap={10}>
                          <Text
                            className={`card-box border text-color-two padding-small-box font-xsmall`}
                          >
                            ${" "}
                            {(
                              ((Number(lendModalData.repayAmount) -
                                Number(lendModalData.loanAmount)) /
                                ETH_ZERO) *
                              coinValue
                            ).toFixed(4)}
                          </Text>

                          <Text
                            className={`font-size-16 text-color-one letter-spacing-small`}
                          >
                            ~{" "}
                            {(
                              (Number(lendModalData.repayAmount) -
                                Number(lendModalData.loanAmount)) /
                              ETH_ZERO
                            ).toFixed(4)}
                          </Text>
                          <img
                            src={Bitcoin}
                            alt="noimage"
                            style={{ justifyContent: "center" }}
                            width={25}
                          />
                        </Flex>
                      </Col>
                    </Row>

                    <Row justify={"space-between"} className="mt-7">
                      <Col>
                        <Text
                          className={`font-size-16 text-color-one letter-spacing-small`}
                        >
                          Platform fee
                        </Text>
                      </Col>
                      <Col>
                        <Flex align="center" gap={10}>
                          <Text
                            className={`card-box border text-color-two padding-small-box font-xsmall`}
                          >
                            ${" "}
                            {(
                              (Number(lendModalData.platformFee) / ETH_ZERO) *
                              coinValue
                            ).toFixed(4)}
                          </Text>

                          <Text
                            className={`font-size-16 text-color-one letter-spacing-small`}
                          >
                            ~{" "}
                            {(
                              Number(lendModalData.platformFee) / ETH_ZERO
                            ).toFixed(4)}
                          </Text>
                          <img
                            src={Bitcoin}
                            alt="noimage"
                            style={{ justifyContent: "center" }}
                            width={25}
                          />
                        </Flex>
                      </Col>
                    </Row>

                    <Row className="mt-15">
                      <Col>
                        <span className={`font-xsmall text-color-two`}>
                          <TbInfoSquareRounded
                            size={12}
                            // color={true ? "#adadad" : "#333333"}
                          />{" "}
                          {`Once a lender accepts the offer and the loan is
                started they will have ${Number(
                  lendModalData.duration
                )} days to repay the loan. If
                the loan is not repaid you will receive the
                collateral. Manage the loans in the portfolio page.`}
                        </span>
                      </Col>
                    </Row>
                  </>
                ),
              },
            ]}
          />
        </Col>
      </Row>

      {/* Lend button */}
      <Row
        justify={activeWallet.length ? "end" : "center"}
        className={`${
          activeWallet.length ? "" : "border"
        } border-radius-8 mt-15`}
      >
        <Col xs={24}>
          {activeWallet.length ? (
            <CustomButton
              block
              loading={isOfferBtnLoading}
              className="click-btn font-weight-600 letter-spacing-small"
              title={"Accept loan"}
              onClick={handleAcceptRequest}
            />
          ) : (
            <Flex justify="center">
              <Text
                className={`font-small text-color-one border-padding-medium letter-spacing-small`}
              >
                Connect
              </Text>
            </Flex>
          )}
        </Col>
      </Row>
    </ModalDisplay>
  );
};

export default LendModal;
