import { Col, Flex, Popconfirm, Row, Tooltip, Typography } from "antd";
import axios from "axios";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { FcApproval, FcHighPriority } from "react-icons/fc";
import { ImSad } from "react-icons/im";
import { IoInformationCircleSharp } from "react-icons/io5";
import { LuRefreshCw } from "react-icons/lu";
import { PiCopyBold } from "react-icons/pi";
import { Bars } from "react-loading-icons";
import { Link } from "react-router-dom";
import Bitcoin from "../../assets/coin_logo/edu_coin.png";
import CustomButton from "../../component/Button";
import Notify from "../../component/notification";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import {
  setBorrowCollateral,
  setLoading,
  setUserCollateral,
} from "../../redux/slice/constant";
import {
  Capitalaize,
  TokenContractAddress,
  apiUrl,
  custodyAddress,
  sliceAddress,
} from "../../utils/common";
import tokenAbiJson from "../../utils/tokens_abi.json";

const DBridge = (props) => {
  const { getCollaterals, fetchUserAssets } = props.wallet;
  const { reduxState, dispatch } = props.redux;
  const activeWallet = reduxState.wallet.active;

  const metaAddress = reduxState.wallet.meta.address;
  const chainvalue = reduxState.constant.chainvalue;
  const coinValue = reduxState.constant.coinValue;
  const userCollateral = reduxState.constant.userCollateral;
  const collectionObj = reduxState.constant.approvedCollectionsObj || {};

  const { Text } = Typography;

  // USE STATE
  const [borrowData, setBorrowData] = useState(null);
  const [lendData, setLendData] = useState([]);

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

  const handleTokenMint = async (tokenId, contractAddress) => {
    try {
      dispatch(setLoading(true));

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        TokenContractAddress,
        tokenAbiJson,
        signer
      );

      const mintResult = await contract.mintNFT(tokenId, contractAddress);
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
      if (
        error.message.includes("Token is already minted with this contract")
      ) {
        Notify("error", "Token is already minted with this contract");
      }
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

      const estimatedGas = await contract.estimateGas.burn(obj.token.tokenId);

      // Send the transaction with the estimated gas
      const mintResult = await contract.burn(obj.token.tokenId, {
        gasLimit: estimatedGas * 2, // Optionally, add a buffer here if needed, e.g., estimatedGas.mul(1.2)
      });

      await mintResult.wait();
      if (mintResult.hash) {
        Notify("success", "Token Burn success!");
        getCollaterals();
        await transferUserToken(obj);
      }

      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      console.log("Burn error", error);
    }
  };

  const transferUserToken = async (obj) => {
    try {
      dispatch(setLoading(true));
      // Transfering token to the owner
      const result = await axios.post(
        `${apiUrl.Asset_server_base_url}/api/v1/send/token`,
        {
          tokenId: obj.token.tokenId,
          contract: obj.contract,
          address: metaAddress,
        }
      );

      if (result.data.success) {
        Notify("success", result.data.message);
        getCollaterals();
        fetchUserAssets();
      } else {
        Notify("error", result.data.message);
      }
      dispatch(setLoading(false));
    } catch (error) {
      console.log("Transfer token error", error);
      dispatch(setLoading(false));
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
        const data = collectionObj[obj?.collection?.collectionId];
        return <Text className={"text-color-one"}>{data?.APY}%</Text>;
      },
    },
    {
      key: "Term",
      title: "Term",
      align: "center",
      dataIndex: "terms",
      render: (_, obj) => {
        const data = collectionObj[obj?.collection?.collectionId];
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
        const data = collectionObj[obj?.collection?.collectionId];
        const floor = Number(data.floorAsk?.price?.amount?.decimal)
          ? Number(data.floorAsk?.price?.amount?.decimal)
          : 0;
        return (
          <>
            {floor ? (
              <Flex vertical align="center">
                <Flex
                  align="center"
                  gap={3}
                  className="text-color-one font-xsmall letter-spacing-small"
                >
                  <img src={Bitcoin} alt="noimage" width={20} />
                  {((floor * chainvalue) / coinValue).toFixed(2)}
                </Flex>
                ${(floor * chainvalue).toFixed(2)}
              </Flex>
            ) : (
              "-"
            )}
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
                />
                <Popconfirm
                  onConfirm={() => transferUserToken(obj)}
                  trigger={"click"}
                  title={"Are you sure want this token back?"}
                >
                  <CustomButton
                    title={"Withdraw"}
                    className={"click-btn font-weight-600 letter-spacing-small"}
                    size="medium"
                  />
                </Popconfirm>
              </Flex>
            )}
          </Flex>
        );
      },
    },
  ];

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
              Your NFT token is stored in custody address. Address -
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
                    navigator.clipboard.writeText(custodyAddress);
                  }}
                  size={15}
                />{" "}
              </Tooltip>
              Tokens sent will reflect here within a minutes after they are
              supplied.{" "}
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

      {activeWallet.length ? (
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
                        <ImSad size={25} />
                        <span className="font-medium">
                          Seems you have no tokens!
                        </span>
                      </Flex>
                    ),
                  }}
                  loading={{
                    spinning: userCollateral === null,
                    indicator: <Bars />,
                  }}
                  pagination={{ pageSize: 5 }}
                  rowKey={(e) => `${e?.token?.tokenId}-${e?.timestamp}`}
                  tableColumns={AssetsToSupplyTableColumns}
                  tableData={userCollateral}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      ) : (
        <Row
          justify={"center"}
          className="gradient-text-two font-large font-weight-600 mt-150"
        >
          Connect Metamask Wallet!
        </Row>
      )}
    </>
  );
};

export default propsContainer(DBridge);
