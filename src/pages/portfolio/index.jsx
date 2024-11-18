import {
  Checkbox,
  Col,
  Divider,
  Dropdown,
  Flex,
  Radio,
  Row,
  Tooltip,
  Typography,
} from "antd";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { BiSolidSpreadsheet } from "react-icons/bi";
import { FaHandHolding, FaMoneyBillAlt } from "react-icons/fa";
import { FcApproval, FcOk } from "react-icons/fc";
import { FiArrowDownLeft } from "react-icons/fi";
import { HiMiniReceiptPercent } from "react-icons/hi2";
import { IoInformationCircleSharp } from "react-icons/io5";
import { MdContentCopy, MdDeleteForever, MdTour } from "react-icons/md";
import { TbSend } from "react-icons/tb";
import { Bars } from "react-loading-icons";
import { Link } from "react-router-dom";
import Bitcoin from "../../assets/coin_logo/edu_coin.png";
import CustomButton from "../../component/Button";
import WalletUI from "../../component/download-wallets-UI";
import ModalDisplay from "../../component/modal";
import Notify from "../../component/notification";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import { setLoading } from "../../redux/slice/constant";
import borrowJson from "../../utils/borrow_abi.json";
import {
  BorrowContractAddress,
  Capitalaize,
  custodyAddress,
  DateTimeConverter,
  sliceAddress,
  TokenContractAddress,
} from "../../utils/common";
import tokenJson from "../../utils/tokens_abi.json";
import Web3 from "web3";

const Portfolio = (props) => {
  const { reduxState, dispatch } = props.redux;
  const activeWallet = reduxState.wallet.active;
  const walletState = reduxState.wallet;
  const dashboardData = reduxState.constant.dashboardData;
  const userAssets = reduxState.constant.userAssets || [];
  const collectionObj = reduxState.constant.approvedCollectionsObj || {};

  const btcValue = reduxState.constant.ethvalue;
  const coinValue = reduxState.constant.coinValue;
  const metaAddress = walletState.meta.address;

  const ETH_ZERO = process.env.REACT_APP_ETH_ZERO;

  const { Text } = Typography;
  const [copy, setCopy] = useState("Copy");
  const [agreeCheckbox, setAgreeCheckbox] = useState(false);

  const [downloadWalletModal, setDownloadWalletModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handleSupplyModal, setHandleSupplyModal] = useState(false);
  const [supplyModalItems, setSupplyModalItems] = useState({});
  const [isSupplyModalLoading, setIsSupplyModalLoading] = useState(false);

  const [userLendings, setUserLendings] = useState(null);
  const [userRequests, setUserRequests] = useState(null);
  const [userBorrowings, setUserBorrowings] = useState(null);

  const [radioBtn, setRadioBtn] = useState("Assets");
  const [enableTour, setEnableTour] = useState(false);

  const portfolioCards = [
    {
      title: "Active Lending",
      icon: FaHandHolding,
      value: Number(dashboardData.activeLendings),
    },
    {
      title: "Active Borrowing",
      icon: FiArrowDownLeft,
      value: Number(dashboardData.activeBorrows),
    },
    {
      title: "Completed Loans",
      icon: BiSolidSpreadsheet,
      value: Number(dashboardData.completedLoans),
    },
    {
      title: "Lendings Value",
      icon: FaMoneyBillAlt,
      value: Number(dashboardData.lendingValue),
    },
    {
      title: "Borrowings Value",
      icon: FaMoneyBillAlt,
      value: Number(dashboardData.borrowValue),
    },
    {
      title: "Profit Earned",
      icon: HiMiniReceiptPercent,
      value: Number(dashboardData.profitEarned),
    },
  ];

  const handleTour = () => {
    localStorage.setItem("isTourEnabled", true);
    setEnableTour(!enableTour);
  };

  const radioOptions = [
    {
      label: "Assets",
      value: "Assets",
    },
    {
      label: "Offers",
      value: "Offers",
    },
    {
      label: "Lendings",
      value: "Lendings",
    },
    {
      label: "Borrowings",
      value: "Borrowings",
    },
  ];

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

  const handleOk = () => {
    setIsModalOpen(false);
    setHandleSupplyModal(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setAgreeCheckbox(false);
    setHandleSupplyModal(false);
    setIsSupplyModalLoading(false);
  };

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
              src={obj.image}
              alt={`${obj.id}-borrow_image`}
              className="border-radius-30"
              onError={(e) =>
                (e.target.src = `https://i.seadn.io/s/raw/files/b1ee9db8f2a902b373d189f2c279d81d.png?w=500&auto=format`)
              }
              width={70}
              height={70}
            />
            <Text className="text-color-one font-xsmall letter-spacing-small">
              {obj.name}
            </Text>
          </Flex>
        </>
      ),
    },
    {
      key: "Floor Price",
      title: "Floor price",
      align: "center",
      dataIndex: "value",
      render: (_, obj) => {
        const floor = Number(obj?.collection?.floorAskPrice?.amount?.decimal)
          ? Number(obj?.collection?.floorAskPrice?.amount?.decimal)
          : 0;
        return (
          <>
            {floor ? (
              <Flex vertical gap={3} align="center">
                <Flex
                  gap={5}
                  align="center"
                  className="text-color-one font-xsmall letter-spacing-small"
                >
                  <img src={Bitcoin} alt="noimage" width={20} />
                  {((floor * btcValue) / coinValue).toFixed(2)}{" "}
                </Flex>
                <span className="text-color-two font-xsmall letter-spacing-small">
                  $ {(floor * btcValue).toFixed(2)}
                </span>
              </Flex>
            ) : (
              <span className="text-color-two font-medium letter-spacing-small">
                -
              </span>
            )}
          </>
        );
      },
    },
    {
      key: "APY",
      title: "APY",
      align: "center",
      dataIndex: "category_id",
      render: (id, obj) => {
        return <Text className="text-color-two font-xsmall">5%</Text>;
      },
    },
    {
      key: "Can be collateral",
      title: "Can be collateral",
      align: "center",
      dataIndex: "link",
      render: (_, obj) => (
        <>
          <FcApproval color="orange" size={30} />
        </>
      ),
    },
    {
      key: "Action Buttons",
      title: " ",
      align: "center",
      render: (_, obj) => {
        const objs = {
          ...obj,
          collection: {
            ...obj.collection,
            ...collectionObj[obj.collection.slug],
          },
        };
        return (
          <Flex gap={5}>
            <Dropdown.Button
              className="dbButtons-grey font-weight-600 letter-spacing-small"
              trigger={"click"}
              onClick={() => {
                setHandleSupplyModal(true);
                setSupplyModalItems(objs);
              }}
              menu={{
                items: options,
                onClick: () => setSupplyModalItems(objs),
              }}
            >
              Supply
            </Dropdown.Button>
          </Flex>
        );
      },
    },
  ];
  console.log(supplyModalItems);

  const loanColumns = [
    {
      key: "ordinalId",
      title: "Ordinal Id",
      align: "center",
      dataIndex: "ordinalId",
      render: (_, obj) => (
        <Text className="text-color-one">#{Number(obj.tokenId)}</Text>
      ),
    },
    {
      key: "lender",
      title: "Lender",
      align: "center",
      dataIndex: "lender",
      render: (_, obj) => (
        <Tooltip title={obj.lender}>
          <Text className="text-color-one">{sliceAddress(obj.lender)}</Text>
        </Tooltip>
      ),
    },
    {
      key: "borrower",
      title: "Borrower",
      align: "center",
      dataIndex: "borrower",
      render: (_, obj) => (
        <Tooltip title={obj.borrower}>
          <Text className="text-color-one">{sliceAddress(obj.borrower)}</Text>
        </Tooltip>
      ),
    },
    {
      key: "dueDate",
      title: "Due at",
      align: "center",
      dataIndex: "dueDate",
      render: (_, obj) => {
        const time = DateTimeConverter(Number(obj.dueDate) * 1000);
        return <Text className="text-color-one">{time}</Text>;
      },
    },
  ];

  const userRequestColumns = [
    {
      key: "ordinalId",
      title: "Ordinal Id",
      align: "center",
      dataIndex: "ordinalId",
      render: (_, obj) => (
        <Text className="text-color-one">#{Number(obj.tokenId)}</Text>
      ),
    },
    {
      key: "loanAmount",
      title: "Loan Amount",
      align: "center",
      dataIndex: "loanAmount",
      render: (_, obj) => (
        <Flex align="center" justify="center" gap={3}>
          <img src={Bitcoin} alt="noimage" width={20} />{" "}
          <Text className="text-color-one">
            {Number(obj.loanAmount) / ETH_ZERO}
          </Text>
        </Flex>
      ),
    },
    {
      key: "platformFee",
      title: "Platform Fee",
      align: "center",
      dataIndex: "platformFee",
      render: (_, obj) => (
        <Flex align="center" justify="center" gap={3}>
          <img src={Bitcoin} alt="noimage" width={20} />{" "}
          <Text className="text-color-one">
            {Number(obj.platformFee) / ETH_ZERO}
          </Text>
        </Flex>
      ),
    },
    {
      key: "repayAmount",
      title: "Repay Amount",
      align: "center",
      dataIndex: "repayAmount",
      render: (_, obj) => (
        <Flex align="center" justify="center" gap={3}>
          <img src={Bitcoin} alt="noimage" width={20} />{" "}
          <Text className="text-color-one">
            {(Number(obj.repayAmount) / ETH_ZERO).toFixed(2)}
          </Text>
        </Flex>
      ),
    },
    {
      key: "action",
      title: " ",
      align: "center",
      dataIndex: "action",
      render: (_, obj) => (
        <MdDeleteForever className="pointer" color="red" size={25} />
      ),
    },
  ];

  const fetchLendingRequests = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const borrowContract = new ethers.Contract(
      BorrowContractAddress,
      borrowJson,
      signer
    );
    const ActiveLendReq = await borrowContract.getActiveLoansByLender(
      metaAddress
    );
    setUserLendings(ActiveLendReq);
  };

  const fetchBorrowingRequests = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const borrowContract = new ethers.Contract(
      BorrowContractAddress,
      borrowJson,
      signer
    );
    const ActiveBorrowReq = await borrowContract.getActiveLoansByBorrower(
      metaAddress
    );
    setUserBorrowings(ActiveBorrowReq);
  };

  const fetchUserRequests = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const borrowContract = new ethers.Contract(
      BorrowContractAddress,
      borrowJson,
      signer
    );
    const UserBorrowReq = await borrowContract.getBorrowRequestsByUser(
      metaAddress
    );
    setUserRequests(UserBorrowReq);
  };

  const handleRepay = async (nftContract, tokenId) => {
    try {
      dispatch(setLoading(true));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const borrowContract = new ethers.Contract(
        BorrowContractAddress,
        borrowJson,
        signer
      );

      const request = await borrowContract.getBorrowRequestByTokenId(
        nftContract,
        tokenId
      );

      // Convert the hex value to BigNumber
      const bigNumberValue = ethers.BigNumber.from(request.repayAmount);

      // Convert to decimal string
      const loanAmount_ = bigNumberValue.toString();

      let _loanAmount = loanAmount_ / ETH_ZERO;
      const Wei_loanAmount = ethers.utils.parseUnits(
        _loanAmount.toString(),
        "ether"
      ); // 1 Core, with 18 decimals

      const requestResult = await borrowContract.loanRepayment(
        nftContract,
        tokenId,
        {
          value: Wei_loanAmount + 1,
        }
      );

      await requestResult.wait();
      if (requestResult.hash) {
        Notify("success", "Repayment success!");
        fetchBorrowingRequests();
      }
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      console.log("repay error", error);
    }
  };
  console.log("supplyModalItems", supplyModalItems);

  async function switchToOpenCampusNetwork() {
    try {
      if (window.ethereum) {
        const chainId = "0xA0F84"; // 656476 in hexadecimal

        // Request MetaMask to add the OpenCampus network
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainId,
              chainName: "OpenCampus Network",
              rpcUrls: ["https://open-campus-codex-sepolia.drpc.org"],
              nativeCurrency: {
                name: "edu",
                symbol: "edu",
                decimals: 18,
              },
              blockExplorerUrls: ["https://explorer.opencampus.org"], // Replace with actual explorer URL if available
            },
          ],
        });

        // After adding the network, request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        console.log("Switched to OpenCampus Network!");
      } else {
        console.error("MetaMask is not installed!");
      }
    } catch (error) {
      console.error("Failed to switch network", error);
    }
  }

  async function switchToPolygonNetwork() {
    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        const chainId = "0x89"; // Polygon Mainnet Chain ID (137 in hex)

        // Request to switch to Polygon network
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainId,
              chainName: "Polygon Mainnet",
              rpcUrls: ["https://polygon-rpc.com/"],
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              blockExplorerUrls: ["https://polygonscan.com/"],
            },
          ],
        });

        // After adding the network, request account access
        // await window.ethereum.request({ method: "eth_requestAccounts" });

        Notify("success", "Switched to Polygon Network!");
      } else {
        Notify("error", "MetaMask is not installed!");
      }
    } catch (error) {
      console.error("Failed to switch network", error);
    }
  }

  const handleTransferToken = async () => {
    try {
      setIsSupplyModalLoading(true);
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      console.log("networkId", networkId);

      if (Number(networkId) !== 137) {
        switchToPolygonNetwork();
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract( //Created with (Nft) token's contract
        supplyModalItems.contract,
        tokenJson,
        signer
      );
      console.log(
        "Token contract",
        supplyModalItems.contract,
        supplyModalItems.tokenId
      );

      // eth call
      const approveRequest = await nftContract.approve(
        custodyAddress, //TO
        supplyModalItems.tokenId //tokenId
      );

      console.log("approveRequest", approveRequest);

      // eth call
      const transferRequest = await nftContract.transferFrom(
        metaAddress, //FROM
        custodyAddress, //TO (custody eth address)
        supplyModalItems.tokenId //tokenId
      );
      console.log("transferRequest", transferRequest);
      Notify("success", "Supply successfull");
      setIsSupplyModalLoading(false);
    } catch (error) {
      setIsSupplyModalLoading(false);
      console.log("Transfer error", error);
    }
  };

  useEffect(() => {
    if (activeWallet.length) {
      (async () => {
        fetchLendingRequests();
        fetchBorrowingRequests();
        fetchUserRequests();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet]);

  // const fetchFloorPrice = async () => {
  //   const price = userAssets.map((collection) => {
  //     return new Promise(async (res) => {
  //       const result = await axios.get(
  //         `${process.env.REACT_APP_OPENSEA_API}/api/v2/collections/${collection.collection}/stats`,
  //         {
  //           headers: {
  //             "x-api-key": process.env.REACT_APP_OPENSEA_APIKEY,
  //           },
  //         }
  //       );
  //       res({ ...collection, price: result.data.total });
  //     });
  //   });
  //   const revealedPromise = await Promise.all(price);
  //   setAssets(revealedPromise);
  // };

  // useEffect(() => {
  //   if (userAssets[0]) {
  //     fetchFloorPrice();
  //   }
  // }, []);
  console.log(userAssets);

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <h1 className="font-xlarge text-color-four letter-spacing-medium-one">
            Portfolio
          </h1>
        </Col>

        <Col>
          <Row justify={"end"} align={"middle"} gutter={32}>
            <Col
              style={{
                border: "1px solid grey",
                borderRadius: "10px",
              }}
            >
              <MdTour
                style={{ cursor: "pointer" }}
                onClick={() => setEnableTour(true)}
                className="text-color-two"
                size={32}
              />
            </Col>
            {activeWallet.length ? (
              <Col>
                <CustomButton
                  onClick={() => setDownloadWalletModal(true)}
                  className={"click-btn font-weight-600 letter-spacing-small"}
                  title="Download wallets"
                />
              </Col>
            ) : (
              ""
            )}
          </Row>
        </Col>
      </Row>

      <Row align={"middle"} className={activeWallet.length && "mt-15"}>
        <Col md={24}>
          <Flex align="center" className="page-box" gap={5}>
            <IoInformationCircleSharp size={25} color="#55AD9B" />
            <Text className="text-color-two font-small">
              Manage your offers, lending, and borrowing positions. Learn more.{" "}
            </Text>
          </Flex>
        </Col>
      </Row>

      {activeWallet.length ? (
        <Row justify={"space-between"} gutter={12} className="mt-20">
          {portfolioCards.map((card, index) => {
            const { icon: Icon, title, value } = card;
            return (
              <Col md={4} key={`${title}-${index}`}>
                <Flex
                  vertical
                  className={`cards-css grey-bg-color pointer card-box-shadow-light`}
                  justify="space-between"
                >
                  <Flex justify="space-between" align="center">
                    <Text
                      className={`gradient-text-one font-small letter-spacing-small`}
                    >
                      {title}
                    </Text>
                    <Icon
                      size={25}
                      color="grey"
                      style={{
                        marginTop: index === 0 ? "-13px" : "",
                      }}
                    />
                  </Flex>
                  <Flex
                    gap={5}
                    align="center"
                    className={`text-color-two font-small letter-spacing-small`}
                  >
                    {title.includes("Value") ? (
                      <img src={Bitcoin} alt="Bitcoin" width={20} />
                    ) : (
                      ""
                    )}{" "}
                    {value ? value : 0}
                  </Flex>
                </Flex>
              </Col>
            );
          })}
        </Row>
      ) : (
        ""
      )}

      <Row align={"middle"} className={activeWallet.length && "mt-15"}>
        <Col xs={24} md={24}>
          <Divider className="m-top-bottom" />
        </Col>
      </Row>

      <Row align={"middle"} justify={"center"} className={"mt-15"}>
        <Radio.Group
          className="radio-css"
          options={radioOptions}
          onChange={({ target: { value } }) => {
            setRadioBtn(value);
          }}
          value={radioBtn}
          size="large"
          buttonStyle="solid"
          optionType="button"
        />
      </Row>

      <Row
        className="mt-15"
        justify={!activeWallet.length ? "center" : "start"}
      >
        <Col
          md={!activeWallet.length ? "" : 24}
          className={!activeWallet.length ? "mt-40" : ""}
        >
          {!activeWallet.length ? (
            <Text className="text-color-one font-medium">Connect wallet!</Text>
          ) : radioBtn === "Assets" ? (
            <Row className="mt-20 pad-bottom-30" gutter={32}>
              <Col xs={24}>
                <Row className="m-bottom">
                  <Col xs={24}>
                    <TableComponent
                      loading={{
                        spinning: userAssets === null,
                        indicator: <Bars />,
                      }}
                      pagination={{ pageSize: 5 }}
                      rowKey={(e) => `${e?.id}-${e?.contract}-${Math.random()}`}
                      tableColumns={AssetsToSupplyTableColumns}
                      tableData={userAssets}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          ) : radioBtn === "Borrowings" ? (
            <Row className="mt-40 pad-bottom-30" gutter={32}>
              <Col xs={24}>
                <Row className="m-bottom">
                  <Col xs={24}>
                    <TableComponent
                      loading={{
                        spinning: userBorrowings === null,
                        indicator: <Bars />,
                      }}
                      pagination={{ pageSize: 5 }}
                      rowKey={(e) =>
                        `${Number(e?.tokenId)}-${Number(
                          e?.repaymentTime
                        )}-${Math.random()}`
                      }
                      tableColumns={[
                        ...loanColumns,
                        {
                          key: "action",
                          title: " ",
                          align: "center",
                          dataIndex: "borrow",
                          render: (_, obj) => {
                            return (
                              <CustomButton
                                className={
                                  "click-btn font-weight-600 letter-spacing-small"
                                }
                                onClick={() => {
                                  handleRepay(
                                    obj.nftContract,
                                    Number(obj.tokenId)
                                  );
                                }}
                                title={
                                  <Flex
                                    align="center"
                                    justify="center"
                                    gap={10}
                                  >
                                    <span
                                      className={`text-color-one font-weight-600 pointer iconalignment font-size-16`}
                                    >
                                      Repay
                                    </span>
                                  </Flex>
                                }
                              />
                            );
                          },
                        },
                      ]}
                      tableData={userBorrowings}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          ) : radioBtn === "Lendings" ? (
            <Row className="mt-40 pad-bottom-30" gutter={32}>
              <Col xs={24}>
                <Row className="m-bottom">
                  <Col xs={24}>
                    <TableComponent
                      loading={{
                        spinning: userLendings === null,
                        indicator: <Bars />,
                      }}
                      pagination={{ pageSize: 5 }}
                      rowKey={(e) =>
                        `${Number(e?.dueDate)}-${Number(
                          e?.tokenId
                        )}-${Math.random()}`
                      }
                      tableColumns={loanColumns}
                      tableData={userLendings}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          ) : radioBtn === "Offers" ? (
            <Row className="mt-40 pad-bottom-30" gutter={32}>
              <Col xs={24}>
                <Row className="m-bottom">
                  <Col xs={24}>
                    <TableComponent
                      loading={{
                        spinning: userRequests === null,
                        indicator: <Bars />,
                      }}
                      pagination={{ pageSize: 5 }}
                      rowKey={(e) =>
                        `${Number(e?.createdAt)}-${Number(
                          e?.repaymentTime
                        )}-${Math.random()}`
                      }
                      tableColumns={userRequestColumns}
                      tableData={userRequests}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          ) : (
            ""
          )}
        </Col>
      </Row>

      <ModalDisplay
        open={enableTour}
        onOK={handleTour}
        onCancel={() => setEnableTour(false)}
        title={
          <Row className="black-bg white-color font-large letter-spacing-small iconalignment">
            <MdTour color="violet" /> Enable Tour
          </Row>
        }
      >
        <Text className="white-color font-medium">
          Are you sure you want to enable tour ?
        </Text>
      </ModalDisplay>

      <ModalDisplay
        open={downloadWalletModal}
        footer={null}
        onCancel={() => setDownloadWalletModal(false)}
        title={
          <Row className="black-bg white-color font-large letter-spacing-small iconalignment">
            Supported Wallets
          </Row>
        }
      >
        <WalletUI isAirdrop={false} />
      </ModalDisplay>

      {/* Asset Details Modal */}
      <ModalDisplay
        width={"50%"}
        title={
          <Row className="white-color font-large letter-spacing-small">
            Token Details
          </Row>
        }
        footer={null}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Row className="mt-30" justify={"space-between"}>
          <Col md={3}>
            <Text className="gradient-text-one font-small font-weight-600">
              Token Info
            </Text>
          </Col>
          <Col md={20}>
            <Row>
              <Col md={10}>
                {supplyModalItems && (
                  <>
                    <Flex gap={5} vertical align="center">
                      <img
                        src={supplyModalItems.image}
                        alt={`${supplyModalItems.id}-borrow_image`}
                        onError={(e) =>
                          (e.target.src = `https://i.seadn.io/s/raw/files/b1ee9db8f2a902b373d189f2c279d81d.png?w=500&auto=format`)
                        }
                        className="border-radius-30"
                        width={100}
                        height={100}
                      />
                      {/* <Text className="text-color-one font-xsmall font-weight-600">
                        {Capitalaize(supplyModalItems.name)}
                      </Text> */}
                    </Flex>
                  </>
                )}
              </Col>

              <Col md={13}>
                <Row>
                  <Flex vertical>
                    <Text className="text-color-two font-small">Contract</Text>
                    <Text className="text-color-one font-xsmall font-weight-600">
                      {supplyModalItems?.contract}
                      <Tooltip
                        arrow
                        title={copy}
                        trigger={"hover"}
                        placement="top"
                      >
                        <MdContentCopy
                          className="pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              supplyModalItems?.contract
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
                    </Text>
                  </Flex>
                </Row>
                <Row>
                  {" "}
                  <Flex vertical>
                    <Text className="text-color-two font-small">Token ID</Text>
                    <Text className="text-color-one font-small font-weight-600 iconalignment">
                      #{supplyModalItems.tokenId}
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
                {Capitalaize(supplyModalItems?.collection?.name)}
              </Text>
            </Row>

            <Row className="mt-30" justify={"space-between"}>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Floor Price</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyModalItems?.collection?.floorAskPrice?.amount?.decimal
                    ? supplyModalItems?.collection?.floorAskPrice?.amount
                        ?.decimal
                    : "-"}
                </Text>
              </Flex>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Token Count</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyModalItems?.collection?.tokenCount}
                </Text>
              </Flex>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Total Volume</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyModalItems?.collection?.volume?.allTime
                    ? supplyModalItems?.collection?.volume?.allTime
                    : 0}
                </Text>
              </Flex>
            </Row>

            <Row justify={"space-between"} className="m-25">
              <Flex vertical>
                <Text className="text-color-two font-small">Owners</Text>

                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {supplyModalItems?.collection?.ownerCount}
                  </Text>
                </Row>
              </Flex>
              <Flex vertical>
                <Text className="text-color-two font-small ">Created At</Text>
                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {new Date(
                      supplyModalItems?.collection?.createdAt
                    ).toUTCString()}
                  </Text>
                </Row>
              </Flex>
              <Flex vertical>
                <Text className="text-color-two font-small">Supply</Text>
                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {supplyModalItems?.collection?.supply}
                  </Text>
                </Row>
              </Flex>
            </Row>
          </Col>
        </Row>
      </ModalDisplay>

      {/* Custody supply address display */}
      <ModalDisplay
        width={"30%"}
        open={handleSupplyModal}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
      >
        <Row justify={"center"}>
          <FcOk size={50} />
        </Row>
        <Row justify={"center"}>
          <Text className="text-color-one font-xlarge font-weight-600 m-25">
            Bridge Token
          </Text>
        </Row>

        <Row className="mt-15" justify={"space-between"}>
          <Col xs={11}>
            <Flex gap={5} vertical align="center">
              <img
                src={supplyModalItems?.image}
                alt={`${supplyModalItems.tokenId}-borrow_image`}
                className="border-radius-30"
                width={70}
                height={70}
              />
              <span className="text-color-two">{supplyModalItems.name}</span>
            </Flex>
          </Col>

          <Col xs={11}>
            <Flex vertical gap={5}>
              <Flex vertical className="borrowDataStyle border border-radius-5">
                <Text className="text-color-two font-small">Floor</Text>

                <Text className="text-color-one font-xsmall font-weight-600">
                  {supplyModalItems?.collection?.floorAskPrice?.amount?.decimal
                    ? supplyModalItems?.collection?.floorAskPrice?.amount
                        ?.decimal
                    : "-"}
                </Text>
              </Flex>

              <Flex vertical className="borrowDataStyle border">
                <Text className="text-color-two font-small">Token ID</Text>

                <Text className="text-color-one font-xsmall font-weight-600">
                  {supplyModalItems?.tokenId}
                </Text>
              </Flex>
            </Flex>
          </Col>
        </Row>

        <Row justify={"start"}>
          <span className="text-color-two font-medium">Contract</span>
        </Row>

        <Row
          justify={"space-around"}
          align={"middle"}
          className="border border-radius-5"
        >
          <Col md={19}>
            <span className="text-color-two font-xssmall">
              {supplyModalItems.contract}
            </span>
          </Col>
          <Col md={3}>
            <Row justify={"end"} align="middle" className="mt-5">
              <Link
                to={`https://etherscan.io/address/${supplyModalItems}.contract`}
              >
                <TbSend className="pointer" size={20} color="#764ba2" />
              </Link>
            </Row>
          </Col>
        </Row>

        <Row>
          <span className="text-color-two mt-15 pointer" id="agree">
            <Checkbox
              for="agree"
              value={agreeCheckbox}
              onChange={(e) => setAgreeCheckbox(e.target.checked)}
            />{" "}
            I agree to transfer the NFT to EDU bridge as collateral for a loan.
          </span>
        </Row>

        <Row>
          <CustomButton
            block
            loading={isSupplyModalLoading}
            onClick={() => {
              if (agreeCheckbox) {
                handleTransferToken();
              } else {
                Notify("info", "Agree terms and conditions!");
              }
            }}
            title="Supply"
            className="click-btn font-weight-600 letter-spacing-small m-25"
          />
        </Row>
      </ModalDisplay>
    </>
  );
};
export default propsContainer(Portfolio);
