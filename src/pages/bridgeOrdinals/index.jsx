import { Col, Divider, Flex, Row, Tooltip, Typography } from "antd";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { FaRegSmileWink } from "react-icons/fa";
import { FcApproval, FcHighPriority } from "react-icons/fc";
import { ImSad } from "react-icons/im";
import { IoInformationCircleSharp, IoWarningSharp } from "react-icons/io5";
import { LuRefreshCw } from "react-icons/lu";
import { MdContentCopy } from "react-icons/md";
import { PiCopyBold } from "react-icons/pi";
import { Bars } from "react-loading-icons";
import { Link } from "react-router-dom";
import Bitcoin from "../../assets/coin_logo/edu_coin.png";
import CustomButton from "../../component/Button";
import ModalDisplay from "../../component/modal";
import Notify from "../../component/notification";
import TableComponent from "../../component/table";
import WalletConnectDisplay from "../../component/wallet-error-display";
import { propsContainer } from "../../container/props-container";
import {
  setBorrowCollateral,
  setLoading,
  setUserCollateral,
} from "../../redux/slice/constant";
import {
  Capitalaize,
  MAGICEDEN_WALLET_KEY,
  TokenContractAddress,
  UNISAT_WALLET_KEY,
  custodyAddress,
  sliceAddress,
} from "../../utils/common";
import tokenAbiJson from "../../utils/tokens_abi.json";
import axios from "axios";

const DBridge = (props) => {
  const { getCollaterals } = props.wallet;
  const { reduxState, isPlugError, dispatch } = props.redux;
  const activeWallet = reduxState.wallet.active;

  const walletState = reduxState.wallet;
  const metaAddress = reduxState.wallet.meta.address;
  const btcValue = reduxState.constant.ethvalue;
  const coinValue = reduxState.constant.coinValue;
  const userCollateral = reduxState.constant.userCollateral;
  const borrowCollateral = reduxState.constant.borrowCollateral;
  const collectionObj = reduxState.constant.approvedCollectionsObj || {};
  // console.log("userCollateral", userCollateral);

  const { Text } = Typography;

  // USE STATE
  const [borrowData, setBorrowData] = useState(null);
  const [lendData, setLendData] = useState([]);
  const [ethAssets, setEthAssets] = useState([]);

  const [copy, setCopy] = useState("Copy");

  const [supplyModalItems, setSupplyModalItems] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handleSupplyModal, setHandleSupplyModal] = useState(false);

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;
  const CONTENT_API = process.env.REACT_APP_ORDINALS_CONTENT_API;

  // COMPONENTS & FUNCTIONS
  if (borrowData !== null) {
    borrowData.sort((a, b) => {
      return a.inscriptionNumber - b.inscriptionNumber;
    });
  }

  if (lendData.length !== 0) {
    lendData.sort((a, b) => {
      return a.inscriptionNumber - b.inscriptionNumber;
    });
  }

  const handleOk = () => {
    setIsModalOpen(false);
    setHandleSupplyModal(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setHandleSupplyModal(false);
  };

  const options = [
    {
      key: "1",
      label: (
        <CustomButton
          className={"click-btn font-weight-600 letter-spacing-small"}
          title={"Details"}
          size="medium"
          onClick={() => setIsModalOpen(true)}
        />
      ),
    },
  ];

  const handleTokenMint = async (tokenId, contractAddress) => {
    try {
      dispatch(setLoading(true));
      console.log("tokenId, contractAddress", tokenId, contractAddress);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        TokenContractAddress,
        tokenAbiJson,
        signer
      );

      const mintResult = await contract.mintOrdinal(tokenId, contractAddress);
      await mintResult.wait();
      if (mintResult.hash) {
        Notify("success", "Minting success!");
        setInterval(() => {
          getCollaterals();
        }, [2000]);
      }
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      console.log("minting error", error);
    }
  };

  const handleTokenBurn = async (obj) => {
    try {
      dispatch(setLoading(true));

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        TokenContractAddress,
        tokenAbiJson,
        signer
      );

      const mintResult = await contract.burn(obj.token.tokenId);
      await mintResult.wait();
      if (mintResult.hash) {
        Notify("success", "Burn success!");
        getCollaterals();
        // fetchContractPoints();
      }

      const result = await axios.post(
        "http://localhost:3030/api/v1/send/token",
        {
          tokenId: obj.token.tokenId,
          contract: obj.contract,
        }
      );
      if (result.data.success) {
        Notify("success", result.data.message);
      } else {
        Notify("error", result.data.message);
      }
      console.log("result", result.data);
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      console.log("Burn error", error);
    }
  };

  useEffect(() => {
    if (activeWallet.length === 0) {
      setLendData([]);
      setBorrowData([]);
    }
  }, [activeWallet]);

  // T1 --------------------------------------------------------------
  const AssetsToSupplyTableColumns = [
    {
      key: "Asset",
      title: "Asset",
      align: "center",
      dataIndex: "asset",
      render: (_, obj) => (
        <>
          <Flex gap={5} vertical align="center">
            <img
              src={obj?.token?.tokenImage}
              alt={`${obj?.timestamp}-borrow_image`}
              onError={(e) =>
                (e.target.src = `https://i.seadn.io/s/raw/files/b1ee9db8f2a902b373d189f2c279d81d.png?w=500&auto=format`)
              }
              y
              className="border-radius-30"
              width={70}
              height={70}
            />
            {Capitalaize(obj?.token?.tokenName) ||
              Capitalaize(obj?.collection?.collectionName)}
          </Flex>
        </>
      ),
    },
    {
      key: "APY",
      title: "APY",
      align: "center",
      dataIndex: "APY",
      render: (_, obj) => {
        const data = collectionObj[obj?.collection?.slug];
        return <Text className={"text-color-one"}>{data?.APY}%</Text>;
      },
    },
    {
      key: "Term",
      title: "Term",
      align: "center",
      dataIndex: "terms",
      render: (_, obj) => {
        const data = collectionObj[obj?.collection?.slug];
        return (
          <Text className={"text-color-one"}>{Number(data?.terms)} Days</Text>
        );
      },
    },
    {
      key: "LTV",
      title: "LTV",
      align: "center",
      dataIndex: "ltv",
      render: (_, obj) => {
        return (
          <Text className={"text-color-one"}>
            {obj?.loanToValue ? obj?.collection?.loanToValue : 0}%
          </Text>
        );
      },
    },
    {
      key: "Floor Price",
      title: "Floor price",
      align: "center",
      dataIndex: "value",
      render: (_, obj) => {
        const floor = Number(obj?.collection?.floorPrice)
          ? Number(obj?.collection?.floorPrice)
          : 0.0035;
        return (
          <>
            <Flex vertical align="center">
              <Flex
                align="center"
                gap={3}
                className="text-color-one font-xsmall letter-spacing-small"
              >
                <img src={Bitcoin} alt="noimage" width={20} />
                {(((floor / BTC_ZERO) * btcValue) / coinValue).toFixed(2)}{" "}
              </Flex>
              ${((floor / BTC_ZERO) * btcValue).toFixed(2)}
            </Flex>
          </>
        );
      },
    },
    {
      key: "Can be collateral",
      title: "Can be collateral",
      align: "center",
      dataIndex: "link",
      render: (_, obj) => (
        <>
          {obj.isToken ? (
            <FcApproval size={30} />
          ) : (
            <FcHighPriority size={30} />
          )}
        </>
      ),
    },
    {
      key: "Action Buttons",
      title: (
        <Tooltip title="You can create borrow request using your minted collateral ordinals!">
          <IoInformationCircleSharp size={25} color="#55AD9B" />
        </Tooltip>
      ),
      align: "center",
      render: (_, obj) => {
        return (
          <Flex gap={5} justify="center">
            {obj?.isToken && !obj?.isBorrowRequest && !obj?.inLoan ? (
              <CustomButton
                className="click-btn font-weight-600 letter-spacing-small"
                trigger={"click"}
                disabled={!obj.isToken}
                onClick={() => {
                  handleTokenBurn(obj);
                }}
                title={"Burn🔥"}
              />
            ) : obj.isBorrowRequest ? (
              <Text className={"text-color-one font-small"}>Offer created</Text>
            ) : obj.inLoan ? (
              <Text className={"text-color-one font-small"}>In Loan</Text>
            ) : (
              <Flex gap={5}>
                <CustomButton
                  className={"click-btn font-weight-600 letter-spacing-small"}
                  title={"Mint"}
                  size="medium"
                  onClick={() =>
                    handleTokenMint(obj.token.tokenId, obj.contract)
                  }
                  menu={{
                    items: options,
                    onClick: () => setSupplyModalItems(obj),
                  }}
                />
              </Flex>
            )}
            {/* {obj.isToken ? (
              <Text className={"text-color-one font-small"}>Minted</Text>
            ) : (
              <CustomButton
                className={"click-btn font-weight-600 letter-spacing-small"}
                title={"Mint"}
                size="medium"
                onClick={() => handleTokenMint(obj.tokenId)}
                menu={{
                  items: options,
                  onClick: () => setSupplyModalItems(obj),
                }}
              />
            )} */}
          </Flex>
        );
      },
    },
  ];

  // useEffect(() => {
  //   (async () => {
  //     if (activeWallet.length) {
  //       const options = {
  //         method: "GET",
  //         url: `${process.env.REACT_APP_MAGICEDEN_API}/v3/rtp/polygon/users/activity/v6?users=0x864C1509bDd19F36e91Fee9F12473453C856df66&limit=20&sortBy=eventTimestamp&includeMetadata=true`,
  //         headers: {
  //           accept: "*/*",
  //           Authorization: process.env.REACT_APP_MAGICEDEN_BEARER,
  //         },
  //       };

  //       const result = await axios.request(options);
  //       const activities = result.data.activities.filter(
  //         (activity) => activity.type === "transfer"
  //       );

  //       const userActivity = activities.filter(
  //         (activity) =>
  //           activity.fromAddress.toLowerCase() ===
  //             "0xe98b997f529f643bc67f217b1270a0f7d7a0ecb2".toLowerCase() &&
  //           activity.toAddress.toLowerCase() === custodyAddress.toLowerCase()
  //       );
  //       const uniqueTokens = userActivity.reduce((map, item) => {
  //         const { tokenId } = item.token;
  //         // If tokenId doesn't exist in map or the current item's timestamp is more recent
  //         if (!map[tokenId] || map[tokenId].timestamp < item.timestamp) {
  //           map[tokenId] = item; // Update with the more recent entry
  //         }
  //         return map;
  //       }, {});
  //       console.log(Object.values(uniqueTokens));
  //       setEthAssets(Object.values(uniqueTokens));
  //     }
  //   })();
  // }, []);
  console.log("userColl", userCollateral);

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <h1 className="font-xlarge text-color-four letter-spacing-medium-one">
            DBridge
          </h1>
        </Col>
      </Row>

      <Row justify={"space-between"} align={"middle"}>
        <Col md={24}>
          <Flex className="page-box" align="center" gap={3}>
            <IoInformationCircleSharp size={25} color="#55AD9B" />
            <Text className="font-small text-color-two">
              Your ordinal inscription stored in custody address. Address -
              <Link to={`https://opensea.io/AbishekJ`} target="_blank">
                <Tooltip className="link" title={custodyAddress}>
                  {" "}
                  {sliceAddress(custodyAddress)}
                </Tooltip>
                .
              </Link>{" "}
              <Tooltip title="Copied" trigger={"click"}>
                <PiCopyBold
                  className="pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "bc1pjj4uzw3svyhezxqq7cvqdxzf48kfhklxuahyx8v8u69uqfmt0udqlhwhwz"
                    );
                  }}
                  size={15}
                />{" "}
              </Tooltip>
              Tokens sent will reflect here in 5minutes after they supplied.{" "}
            </Text>
          </Flex>
        </Col>
      </Row>

      <Row justify={"end"} align={"middle"} className="mt-20">
        {activeWallet.length ? (
          <Col
            onClick={() => {
              dispatch(setBorrowCollateral(null));
              dispatch(setUserCollateral(null));
              getCollaterals();
            }}
          >
            <LuRefreshCw
              className={`pointer ${userCollateral === null ? "spin" : ""}`}
              color="whitesmoke"
              size={25}
            />
          </Col>
        ) : (
          ""
        )}
      </Row>

      <Row
        justify={"space-between"}
        className="mt-20 pad-bottom-30"
        gutter={32}
      >
        <Col xl={24}>
          <Row className="m-bottom">
            <Col xl={24}>
              <TableComponent
                locale={{
                  emptyText: (
                    <Flex align="center" justify="center" gap={5}>
                      {!metaAddress ? (
                        <>
                          <FaRegSmileWink size={25} />
                          <span className="font-medium">
                            Connect any BTC Wallet !
                          </span>
                        </>
                      ) : (
                        <>
                          <ImSad size={25} />
                          <span className="font-medium">
                            Seems you have no assets!
                          </span>
                        </>
                      )}
                    </Flex>
                  ),
                }}
                // loading={
                //   {
                //     // spinning: userCollateral === null,
                //     // indicator: <Bars />,
                //   }
                // }
                pagination={{ pageSize: 5 }}
                rowKey={(e) => `${e?.token?.tokenId}-${e?.timestamp}`}
                tableColumns={AssetsToSupplyTableColumns}
                tableData={userCollateral}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      {/* MODAL START */}
      {/* Asset Details Modal */}
      <ModalDisplay
        width={"50%"}
        title={
          <Row className="black-bg white-color font-large letter-spacing-small">
            Details
          </Row>
        }
        footer={null}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Row className="mt-30">
          <Col md={6}>
            <Text className="gradient-text-one font-small font-weight-600">
              Asset Info
            </Text>
          </Col>
          <Col md={18}>
            <Row>
              <Col md={12}>
                {supplyModalItems &&
                  (supplyModalItems?.mimeType === "text/html" ? (
                    <iframe
                      className="border-radius-30"
                      title={`${supplyModalItems?.id}-borrow_image`}
                      height={300}
                      width={300}
                      src={`${CONTENT_API}/content/${supplyModalItems?.id}`}
                    />
                  ) : (
                    <>
                      <img
                        src={`${CONTENT_API}/content/${supplyModalItems?.id}`}
                        alt={`${supplyModalItems?.id}-borrow_image`}
                        className="border-radius-30"
                        width={125}
                      />
                      <Row>
                        <Text className="text-color-one ml">
                          <span className="font-weight-600 font-small ">
                            ${" "}
                          </span>
                          {(
                            (Number(supplyModalItems?.collection?.floorPrice) /
                              BTC_ZERO) *
                            btcValue
                          ).toFixed(2)}
                        </Text>
                      </Row>
                    </>
                  ))}
              </Col>

              <Col md={12}>
                <Row>
                  {" "}
                  <Flex vertical>
                    <Text className="text-color-two font-small">
                      Inscription Number
                    </Text>
                    <Text className="text-color-one font-small font-weight-600">
                      #{supplyModalItems?.inscriptionNumber}
                    </Text>
                  </Flex>
                </Row>
                <Row>
                  {" "}
                  <Flex vertical>
                    <Text className="text-color-two font-small">
                      Inscription Id
                    </Text>

                    <Text className="text-color-one font-small font-weight-600 iconalignment">
                      {sliceAddress(supplyModalItems?.id, 7)}
                      <Tooltip
                        arrow
                        title={copy}
                        trigger={"hover"}
                        placement="top"
                      >
                        <MdContentCopy
                          className="pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(supplyModalItems?.id);
                            setCopy("Copied");
                            setTimeout(() => {
                              setCopy("Copy");
                            }, 2000);
                          }}
                          size={20}
                          color="#764ba2"
                        />
                      </Tooltip>
                    </Text>
                  </Flex>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider />
        <Row className="mt-15">
          <Col md={6}>
            <Text className="gradient-text-one font-small font-weight-600">
              Collection Info
            </Text>
          </Col>
          <Col md={18}>
            <Row justify={"center"}>
              <Text className="gradient-text-two font-xslarge font-weight-600 ">
                {Capitalaize(supplyModalItems?.collection?.symbol)}
              </Text>
            </Row>

            <Row className="mt-30" justify={"space-between"}>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Floor Price</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyModalItems?.collection.floorPrice / BTC_ZERO}
                </Text>
              </Flex>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Total Listed</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyModalItems?.collection.totalListed}
                </Text>
              </Flex>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Total Volume</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyModalItems?.collection.totalVolume}
                </Text>
              </Flex>
            </Row>

            <Row justify={"space-between"} className="m-25">
              <Flex vertical>
                <Text className="text-color-two font-small">Owners</Text>

                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {supplyModalItems?.collection.owners}
                  </Text>
                </Row>
              </Flex>
              <Flex vertical>
                <Text className="text-color-two font-small ">
                  Pending Transactions
                </Text>
                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {supplyModalItems?.collection.pendingTransactions}
                  </Text>
                </Row>
              </Flex>
              <Flex vertical>
                <Text className="text-color-two font-small">Supply</Text>
                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {supplyModalItems?.collection.supply}
                  </Text>
                </Row>
              </Flex>
            </Row>
          </Col>
        </Row>
      </ModalDisplay>

      {/* Custody supply address display */}
      <ModalDisplay
        width={"25%"}
        open={handleSupplyModal}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
      >
        <Row justify={"center"}>
          <IoWarningSharp size={50} color="#f46d6d" />
        </Row>
        <Row justify={"center"}>
          <Text className="text-color-one font-xlarge font-weight-600 m-25">
            Reserved Address
          </Text>
        </Row>
        <Row>
          <span className="text-color-two mt-15">
            This is the token reserved contract address, please do not transfer
            directly through the CEX, you will not be able to confirm the source
            of funds, and you will not be responsible for lost funds.
          </span>
        </Row>
        <Row
          justify={"space-around"}
          align={"middle"}
          className="mt-30  border "
        >
          <Col md={18}>
            <span className="text-color-two">
              bc1pjj4uzw3svyhezxqq7cvqdxzf48kfhklxuahyx8v8u69uqfmt0udqlhwhwz
            </span>
          </Col>
          <Col md={3}>
            <Row justify={"end"}>
              <Tooltip arrow title={copy} trigger={"hover"} placement="top">
                <MdContentCopy
                  className="pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "bc1pjj4uzw3svyhezxqq7cvqdxzf48kfhklxuahyx8v8u69uqfmt0udqlhwhwz"
                    );
                    setCopy("Copied");
                    setTimeout(() => {
                      setCopy("Copy");
                    }, 2000);
                  }}
                  size={20}
                  color="#764ba2"
                />
              </Tooltip>
            </Row>
          </Col>
        </Row>
        <Row>
          <CustomButton
            onClick={handleCancel}
            title="I Know"
            className={"m-25 width background text-color-one "}
          />
        </Row>
      </ModalDisplay>
    </>
  );
};

export default propsContainer(DBridge);
