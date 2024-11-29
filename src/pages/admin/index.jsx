import {
  Col,
  Flex,
  Input,
  Popconfirm,
  Radio,
  Row,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { BiSolidOffer, BiTransfer } from "react-icons/bi";
import { MdOutlineConfirmationNumber } from "react-icons/md";
import { TbBrightnessDownFilled } from "react-icons/tb";
import { Bars, ThreeDots } from "react-loading-icons";
import { Link } from "react-router-dom";
import EduCoin from "../../assets/coin_logo/edu_coin.png";
import ModalDisplay from "../../component/modal";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import {
  apiUrl,
  calculateAPY,
  calculateOrdinalInCrypto,
  Capitalaize,
  CHAIN_BNB,
  CHAIN_ETHEREUM,
  CHAIN_POLYGON,
  nullAddress,
  sliceAddress,
} from "../../utils/common";
import CustomButton from "../../component/Button";
import axios from "axios";
import Notify from "../../component/notification";
import { setLoading } from "../../redux/slice/constant";

const ActiveLoans = (props) => {
  const { Text } = Typography;
  const { reduxState, dispatch } = props.redux;
  const { getCollaterals } = props.wallet;
  const api_agent = reduxState.constant.agent;

  const chainvalue = reduxState.constant.chainvalue;
  const coinValue = reduxState.constant.coinValue;

  const [radioBtn, setRadioBtn] = useState("Custody");
  const [chain, setChain] = useState(CHAIN_POLYGON);
  const [isCollectionModal, setIsCollectionModal] = useState(null);
  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const [custodyActivity, setCustodyActivity] = useState(null);
  const [collections, setCollections] = useState(null);
  const [collectionData, setCollectionData] = useState({
    collectionName: "",
    terms: "",
    yield: "",
  });

  const [updateCollectionData, setUpdateCollectionData] = useState({
    collectionName: "",
    name: "",
    terms: "",
    yield: "",
  });

  const custodyActivityColumns = [
    {
      key: "token",
      title: "Token",
      align: "center",
      dataIndex: "token",
      render: (_, obj) => {
        const image =
          obj?.collection?.collectionName === "Polygon Ape: The Mutation"
            ? "https://klekshun.com/_next/static/media/mutation.dc426f61.jpg"
            : obj?.token.tokenImage;

        return (
          <Flex align="center" justify="center" gap={10}>
            <img
              className="border-radius-5"
              src={
                image ||
                "https://i.seadn.io/s/raw/files/b1ee9db8f2a902b373d189f2c279d81d.png?w=500&auto=format"
              }
              alt="token_cards"
              width={60}
              onError={(e) => {
                e.target.src =
                  "https://miro.medium.com/v2/resize:fit:1150/1*AC9frN1qFnn-I2JCycN8fw.png";
                e.target.srcset =
                  "https://miro.medium.com/v2/resize:fit:1150/1*AC9frN1qFnn-I2JCycN8fw.png";
                e.target.onerror = null;
              }}
              srcSet={image}
            />
            <Flex vertical>
              <Text className="text-color-one">
                {obj?.token?.tokenName || obj?.token?.tokenId}
              </Text>
              <span className="text-color-two font-xsmall">
                {obj?.collection?.collectionName}
              </span>
            </Flex>
          </Flex>
        );
      },
    },
    {
      key: "type",
      title: "Type",
      align: "left",
      dataIndex: "type",
      render: (_, obj) => {
        return (
          <Flex align="center" justify="center" gap={5}>
            {obj?.type === "transfer" ? (
              <BiTransfer color="grey" size={20} />
            ) : (
              <TbBrightnessDownFilled color="grey" size={20} />
            )}
            <Text className="text-color-one">{Capitalaize(obj?.type)}</Text>
          </Flex>
        );
      },
    },
    {
      key: "fromAddress",
      title: "From",
      align: "center",
      dataIndex: "fromAddress",
      render: (_, obj) => {
        return (
          <Flex align="center" justify="center">
            {obj?.fromAddress === nullAddress ? (
              <Text className="text-color-primary">NullAddress</Text>
            ) : (
              <Link
                to={`https://opensea.io/${obj?.fromAddress}`}
                className="text-color-two"
                target="_blank"
              >
                <Tooltip title={obj?.fromAddress}>
                  {sliceAddress(obj?.fromAddress, 9)}
                </Tooltip>
              </Link>
            )}
          </Flex>
        );
      },
    },
    {
      key: "toAddress",
      title: "From",
      align: "center",
      dataIndex: "toAddress",
      render: (_, obj) => {
        return (
          <Flex align="center" justify="center">
            {obj?.toAddress === nullAddress ? (
              <Text className="text-color-primary">NullAddress</Text>
            ) : (
              <Link
                to={`https://opensea.io/${obj?.toAddress}`}
                className="text-color-two"
                target="_blank"
              >
                <Tooltip title={obj?.toAddress}>
                  {sliceAddress(obj?.toAddress, 9)}
                </Tooltip>
              </Link>
            )}
          </Flex>
        );
      },
    },
    {
      key: "time",
      title: "Time",
      align: "left",
      dataIndex: "time",
      render: (_, obj) => {
        return (
          <Flex align="center" justify="center" gap={5}>
            <Text className="text-color-one">
              {new Date(obj?.timestamp * 1000).toUTCString()}
            </Text>
          </Flex>
        );
      },
    },
  ];

  const approvedCollectionColumns = [
    {
      key: "Collections",
      title: "Collections",
      align: "center",
      dataIndex: "collectionName",
      render: (_, obj) => {
        const name = obj?.name;
        const nameSplitted = obj?.name?.split(" ");
        let modifiedName = "";
        nameSplitted?.forEach((word) => {
          if ((modifiedName + word).length < 25) {
            modifiedName = modifiedName + " " + word;
          }
        });
        return (
          <Row gutter={10}>
            <Col>
              <img
                className="border-radius-5 loan-cards"
                width={"75px"}
                height={"75px"}
                alt={"collection_images"}
                src={obj?.image}
                onError={(e) =>
                  (e.target.src = `https://i.seadn.io/s/raw/files/b1ee9db8f2a902b373d189f2c279d81d.png?w=500&auto=format`)
                }
              />
            </Col>
            <Col>
              <Flex vertical>
                {name?.length > 35 ? (
                  <Tooltip arrow title={name}>
                    <Text className="heading-one font-small text-color-one">
                      {`${modifiedName}...`}
                    </Text>
                  </Tooltip>
                ) : (
                  <Text className="heading-one font-small text-color-one">
                    {modifiedName}
                  </Text>
                )}

                <Text
                  style={{
                    width: 120,
                  }}
                  className={`text-color-one grey-bg-color border-radius-30 card-box pointer border-color-dark iconalignment shine font-size-16 letter-spacing-small`}
                >
                  <BiSolidOffer size={20} />
                  Accept
                </Text>
              </Flex>
            </Col>
          </Row>
        );
      },
    },
    {
      key: "Floor",
      title: "Floor",
      align: "center",
      dataIndex: "floor",
      render: (_, obj) => {
        const data = calculateOrdinalInCrypto(
          Number(obj?.floorAsk?.price?.amount?.decimal)
            ? Number(obj?.floorAsk?.price?.amount?.decimal)
            : 0.0035,
          chainvalue,
          coinValue
        );
        return (
          <Flex align="center" vertical gap={5}>
            <Flex align="center" vertical gap={5} className={"text-color-one"}>
              <Flex align="center" gap={3}>
                <img src={EduCoin} alt="noimage" width={20} />{" "}
                {data.ordinalIncrypto}
              </Flex>
              ${data.ordinalInUSD}
            </Flex>
          </Flex>
        );
      },
    },
    {
      key: "APY",
      title: "APY",
      align: "center",
      dataIndex: "APY",
      render: (_, obj) => (
        <Text className={"text-color-one"}>{Math.round(obj.APY)}%</Text>
      ),
    },
    {
      key: "Term",
      title: "Term",
      align: "center",
      dataIndex: "terms",
      render: (_, obj) => (
        <Text className={"text-color-one"}>{Number(obj.terms)} Days</Text>
      ),
    },
    {
      key: "LTV",
      title: "LTV",
      align: "center",
      dataIndex: "ltv",
      render: (_, obj) => {
        return (
          <Text className={"text-color-one"}>
            {obj?.loanToValue ? obj.loanToValue : 0}%
          </Text>
        );
      },
    },
    {
      key: "ActionButtons",
      title: " ",
      width: "25%",
      align: "center",
      render: (_, obj) => {
        return (
          <Row justify={"space-evenly"}>
            <CustomButton
              className={"click-btn font-weight-600 letter-spacing-small"}
              title={"Update"}
              size="medium"
              onClick={() => {
                setIsUpdateModal(true);
                setUpdateCollectionData({
                  collectionName: obj.collectionName,
                  name: obj.name,
                  terms: obj.terms,
                  yield: obj.yield,
                });
              }}
            />

            <Popconfirm
              onConfirm={() => deleteCollection(obj?.collectionName)}
              trigger={"click"}
              title={"Are you sure want this collection?"}
            >
              <CustomButton
                className={"click-btn font-weight-600 letter-spacing-small"}
                title={"Delete"}
                size="medium"
              />
            </Popconfirm>
          </Row>
        );
      },
    },
  ];

  const modalCollapse = () => {
    setIsCollectionModal(!isCollectionModal);
    if (isCollectionModal) {
      setCollectionData({
        collectionName: "",
        terms: "",
        yield: "",
      });
    }
  };

  const onChangeCollectionData = (e) => {
    setCollectionData({ ...collectionData, [e.target.name]: e.target.value });
  };

  const onChangeUpdateCollectionData = (e) => {
    setUpdateCollectionData({
      ...updateCollectionData,
      [e.target.name]: e.target.value,
    });
  };

  const storeCollectionData = async () => {
    try {
      const { collectionName, terms, yield: yields } = collectionData;
      if (collectionName && terms && yields && api_agent) {
        const payload = {
          collectionID: 1,
          collectionName,
          chainName: chain,
          terms: Number(collectionData.terms),
          yield: Number(collectionData.yield),
        };
        modalCollapse();
        dispatch(setLoading(true));
        await api_agent.addApprovedCollection(payload);
        await fetchCollections();
      } else {
        Notify("warning", "Fill all the fields!");
      }
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      console.log("store collection err", error);
    }
  };

  const updateCanisterCollection = async () => {
    try {
      const { collectionName, terms, yield: yields } = updateCollectionData;
      if (terms && yields && api_agent) {
        dispatch(setLoading(true));
        setIsUpdateModal(false);
        await api_agent.updateYieldNTerms(
          collectionName,
          Number(yields),
          Number(terms)
        );
        await fetchCollections();
      } else {
        Notify("warning", "Fill all the fields!");
      }
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      console.log("Update collection err", error);
    }
  };

  const deleteCollection = async (name) => {
    if (name) {
      try {
        dispatch(setLoading(true));
        await api_agent.removeApprovedCollectionByName(name);
        await fetchCollections();
        dispatch(setLoading(false));
      } catch (error) {
        console.log("delete collection err", error);
      }
    } else {
      Notify("error", "Something went wrong!");
    }
  };

  const fetchCollections = async () => {
    const approvedCollections = await api_agent.getApprovedCollectionsByChain(
      chain
    );

    if (approvedCollections.length) {
      let collectionDetails = [];

      const collectionPromise = approvedCollections.map(async (collection) => {
        const [, col] = collection;
        return new Promise(async (resolve) => {
          const options = {
            method: "GET",
            url: `${apiUrl.Asset_server_base_url}/api/v1/get/collection/${col.collectionName}?chain=${chain}`,
          };
          axios
            .request(options)
            .then((response) => {
              resolve({ ...col, ...response.data.collection });
            })
            .catch((error) => {
              console.log(error);
            });
        });
      });
      collectionDetails = await Promise.all(collectionPromise);

      const finalResult = collectionDetails.map((col) => {
        const { yield: yields, terms } = col;
        const term = Number(terms);
        const APY = calculateAPY(yields, term);
        const LTV = 0;
        return {
          ...col,
          terms: term,
          APY,
          LTV,
        };
      });

      setCollections(finalResult);
    } else {
      setCollections([]);
    }
  };

  useEffect(() => {
    (async () => {
      const isAdminFetch = true;
      const activities = await getCollaterals(isAdminFetch, chain);
      setCustodyActivity(activities);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain]);

  useEffect(() => {
    (async () => {
      if (api_agent) {
        await fetchCollections();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api_agent, dispatch, chain]);

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <h1 className="font-xlarge text-color-four letter-spacing-medium-one">
            Admin Panel
          </h1>
        </Col>
      </Row>

      <Row align={"middle"}>
        <Col>
          <Text className="font-small text-color-one letter-spacing-small">
            Select Chain
          </Text>
        </Col>
      </Row>

      <Row className="mt-15" justify={"start"} align={"middle"}>
        <Radio.Group
          className="radio-css"
          size="large"
          buttonStyle="solid"
          optionType="button"
          value={chain}
          onChange={({ target: { value } }) => {
            setChain(value);
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

      <Row justify={"center"}>
        <Col>
          <Radio.Group
            className="radio-css mt-30"
            options={[
              {
                label: "Custody Activity",
                value: "Custody",
              },
              {
                label: "Collections",
                value: "Collections",
              },
            ]}
            onChange={({ target: { value } }) => {
              setRadioBtn(value);
            }}
            value={radioBtn}
            size="large"
            buttonStyle="solid"
            optionType="button"
          />
        </Col>
      </Row>

      <Row
        justify={radioBtn === "Custody" ? "start" : "space-between"}
        gutter={12}
        align={"middle"}
        className="mt-30"
      >
        <Col md={5}>
          <Flex
            vertical
            gap={15}
            className={`cards-css grey-bg-color pointer card-box-shadow-light`}
            justify="space-between"
          >
            <Flex justify="space-between" align="center">
              <Text
                className={`gradient-text-one font-small letter-spacing-small`}
              >
                {radioBtn === "Custody" ? "Activities" : "Collections"} Count
              </Text>
              <MdOutlineConfirmationNumber size={25} color={"grey"} />
            </Flex>
            <Flex
              gap={5}
              align="center"
              className={`text-color-two font-small letter-spacing-small`}
            >
              #
              {radioBtn === "Custody"
                ? custodyActivity?.length
                : collections?.length}
            </Flex>
          </Flex>
        </Col>

        {radioBtn === "Collections" ? (
          <Col>
            <CustomButton
              className={"click-btn font-weight-600 letter-spacing-small"}
              title={"Add collection"}
              size="medium"
              onClick={modalCollapse}
            />
          </Col>
        ) : (
          ""
        )}
      </Row>

      {radioBtn === "Custody" ? (
        <Row
          className="mt-30 pad-bottom-30 margin-bottom"
          justify={
            custodyActivity === null || !custodyActivity?.length
              ? "center"
              : "start"
          }
          gutter={[32, 32]}
        >
          {custodyActivity === null ? (
            <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
          ) : (
            <>
              {Object?.keys(custodyActivity)?.length ? (
                <Col xs={24}>
                  <TableComponent
                    loading={{
                      spinning: !custodyActivity,
                      indicator: <Bars />,
                    }}
                    pagination={false}
                    rowKey={(e) => `${e?.createdAt}-${e?.timestamp}`}
                    tableData={custodyActivity}
                    tableColumns={custodyActivityColumns}
                  />
                </Col>
              ) : (
                <Text
                  className={`text-color-one mt-7 font-small letter-spacing-small box-padding-one border-radius-5 d-flex-all-center`}
                >
                  No Activities found
                </Text>
              )}
            </>
          )}
        </Row>
      ) : (
        <>
          <Row
            className={`margin-bottom ${
              collections === null ? "mt-90" : "mt-30"
            }`}
            justify={collections === null ? "center" : "start"}
            gutter={[32, 32]}
          >
            {collections === null ? (
              <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
            ) : (
              <Col xs={24}>
                <TableComponent
                  loading={{
                    spinning: !collections,
                    indicator: <Bars />,
                  }}
                  pagination={false}
                  rowKey={(e) => `${e?.createdAt}-${e?.timestamp}`}
                  tableData={collections}
                  tableColumns={approvedCollectionColumns}
                />
              </Col>
            )}
          </Row>
        </>
      )}

      {/* Add collection  */}
      <ModalDisplay
        open={isCollectionModal}
        onCancel={modalCollapse}
        footer={null}
        title={
          <Flex align="center" gap={5} justify="start">
            <Text
              className={`font-size-20 text-color-one letter-spacing-small`}
            >
              Add Collection to {chain}
            </Text>
          </Flex>
        }
      >
        <Row>
          <Col md={24}>
            <Flex vertical align="start">
              <Text
                className={`font-small text-color-one letter-spacing-small`}
              >
                Name
              </Text>
              <Input
                className="input-collection"
                value={collectionData.collectionName}
                size="large"
                name="collectionName"
                onChange={onChangeCollectionData}
              />
            </Flex>
          </Col>
        </Row>

        <Row className="mt-15">
          <Col md={24}>
            <Flex vertical align="start">
              <Text
                className={`font-small text-color-one letter-spacing-small`}
              >
                Terms
              </Text>
              <Input
                className="input-collection"
                value={collectionData.terms}
                size="large"
                name="terms"
                onChange={onChangeCollectionData}
              />
            </Flex>
          </Col>
        </Row>

        <Row className="mt-15">
          <Col md={24}>
            <Flex vertical align="start">
              <Text
                className={`font-small text-color-one letter-spacing-small`}
              >
                Yield
              </Text>
              <Input
                className="input-collection"
                value={collectionData.yield}
                size="large"
                name="yield"
                onChange={onChangeCollectionData}
              />
            </Flex>
          </Col>
        </Row>

        <Row className="mt-40">
          <Col md={24}>
            <CustomButton
              className={"click-btn font-weight-600 letter-spacing-small"}
              title={"Save"}
              size="medium"
              block
              onClick={storeCollectionData}
            />
          </Col>
        </Row>
      </ModalDisplay>

      <ModalDisplay
        open={isUpdateModal}
        onCancel={() => setIsUpdateModal(!isUpdateModal)}
        footer={null}
        title={
          <Flex align="center" gap={5} justify="start">
            <Text
              className={`font-size-20 text-color-one letter-spacing-small`}
            >
              Update Collection for {updateCollectionData.name}
            </Text>
          </Flex>
        }
      >
        <Row className="mt-15">
          <Col md={24}>
            <Flex vertical align="start">
              <Text
                className={`font-small text-color-one letter-spacing-small`}
              >
                Terms
              </Text>
              <Input
                className="input-collection"
                value={updateCollectionData.terms}
                size="large"
                name="terms"
                onChange={onChangeUpdateCollectionData}
              />
            </Flex>
          </Col>
        </Row>

        <Row className="mt-15">
          <Col md={24}>
            <Flex vertical align="start">
              <Text
                className={`font-small text-color-one letter-spacing-small`}
              >
                Yield
              </Text>
              <Input
                className="input-collection"
                value={updateCollectionData.yield}
                size="large"
                name="yield"
                onChange={onChangeUpdateCollectionData}
              />
            </Flex>
          </Col>
        </Row>

        <Row className="mt-40">
          <Col md={24}>
            <CustomButton
              className={"click-btn font-weight-600 letter-spacing-small"}
              title={"Update"}
              size="medium"
              block
              onClick={updateCanisterCollection}
            />
          </Col>
        </Row>
      </ModalDisplay>
    </>
  );
};

export default propsContainer(ActiveLoans);
