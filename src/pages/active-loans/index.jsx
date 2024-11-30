import { Col, Flex, Radio, Row, Typography } from "antd";
import Link from "antd/es/typography/Link";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { IoInformationCircleSharp } from "react-icons/io5";
import { MdOutlineConfirmationNumber } from "react-icons/md";
import { ThreeDots } from "react-loading-icons";
import { propsContainer } from "../../container/props-container";
import {
  API_METHODS,
  apiUrl,
  BorrowContractAddress,
  custodyAddress,
  TokenContractAddress,
} from "../../utils/common";
import tokenAbiJson from "../../utils/tokens_abi.json";

const ActiveLoans = (props) => {
  const { Text } = Typography;
  const { reduxState } = props.redux;
  const { fetchUserAssets } = props.wallet;
  const walletState = reduxState.wallet;

  const approvedCollections = reduxState.constant.approvedCollections;
  const { active } = walletState;

  const [radioBtn, setRadioBtn] = useState("Custody");
  const [contractTokens, setContractTokens] = useState(null);
  const [custodyTokens, setCustodyTokens] = useState(null);

  const getContractCollaterals = async () => {
    try {
      // --------------------------------------------------
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        TokenContractAddress,
        tokenAbiJson,
        signer
      );

      const tokens = await contract.tokensOfOwner(BorrowContractAddress);
      const tokensArray = tokens.map((token) => Number(token.toString()));

      const contractPromise = tokensArray.map((tokenId) => {
        return new Promise(async (res) => {
          const contractId = await contract.tokenContractByID(tokenId);
          res({ contractId, tokenId });
        });
      });

      const promiseResult = await Promise.all(contractPromise);

      let string = "";
      promiseResult.forEach((token) => {
        string = string + `tokens=${token.contractId}%3A${token.tokenId}&`;
      });

      const result = await API_METHODS.post(
        `${apiUrl.Asset_server_base_url}/api/v1/get/tokens`,
        {
          string,
        }
      );

      setContractTokens(result.data.tokens);
    } catch (error) {
      console.log("Collateral fetching error", error);
      if (error.message.includes("No NFT found")) {
        setContractTokens([]);
      }
    }
  };

  useEffect(() => {
    if (active.length && approvedCollections[0]) {
      getContractCollaterals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, approvedCollections]);

  useEffect(() => {
    (async () => {
      const custodyTokens = await fetchUserAssets(custodyAddress);
      setCustodyTokens(custodyTokens);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <h1 className="font-xlarge text-color-four letter-spacing-medium-one">
            Active Loans
          </h1>
        </Col>
      </Row>

      <Row align={"middle"}>
        <Col md={24}>
          <Flex align="center" className="page-box" gap={5}>
            <IoInformationCircleSharp size={25} color="#55AD9B" />
            <Text className="text-color-two font-small">
              Our platform allows you to leverage your valuable NFT assets as
              collateral for loans. Displayed below are the NFTs currently held
              as collateral, showcasing their unique attributes and market
              value. <Link className="font-size-16 pointer">Learn more.</Link>{" "}
            </Text>
          </Flex>
        </Col>
      </Row>

      <Row justify={"center"}>
        <Col>
          <Radio.Group
            className="radio-css mt-30"
            options={[
              {
                label: "On Custody",
                value: "Custody",
              },
              {
                label: "As Collateral",
                value: "Collaterals",
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

      <Row justify={"start"} gutter={12} className="mt-30">
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
                {radioBtn === "Custody" ? "Bridged Tokens" : "Collateral"} Count
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
                ? custodyTokens?.length
                : contractTokens?.length}
            </Flex>
          </Flex>
        </Col>
      </Row>

      {radioBtn === "Custody" ? (
        <Row
          className="mt-30 pad-bottom-30 margin-bottom"
          justify={custodyTokens === null ? "center" : "start"}
          gutter={[32, 32]}
        >
          {custodyTokens === null ? (
            <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
          ) : (
            <>
              {custodyTokens?.length ? (
                <>
                  {custodyTokens.map((token, index) => {
                    const image =
                      token?.collection?.name === "Polygon Ape: The Mutation"
                        ? "https://klekshun.com/_next/static/media/mutation.dc426f61.jpg"
                        : token.image;
                    return (
                      <Col
                        key={`${
                          token?.collection?.name
                        }-${index}-${Math.random()}`}
                        md={4}
                      >
                        <Row
                          className={`border-color-ash pointer border-radius-8 border-padding-medium`}
                        >
                          <Col md={24}>
                            <Flex vertical>
                              <img
                                className="border-radius-5"
                                src={
                                  image ||
                                  "https://i.seadn.io/s/raw/files/b1ee9db8f2a902b373d189f2c279d81d.png?w=500&auto=format"
                                }
                                alt="token_cards"
                                width={"auto"}
                                onError={(e) => {
                                  e.target.src =
                                    "https://miro.medium.com/v2/resize:fit:1150/1*AC9frN1qFnn-I2JCycN8fw.png";
                                  e.target.srcset =
                                    "https://miro.medium.com/v2/resize:fit:1150/1*AC9frN1qFnn-I2JCycN8fw.png";
                                  e.target.onerror = null;
                                }}
                                srcSet={token?.image}
                              />
                              <Text
                                className={`stamp text-color-one mt-7 font-small letter-spacing-small page-box box-padding-one border-radius-5 d-flex-all-center`}
                              >
                                {token?.collection?.name}
                              </Text>
                              <Text
                                className={`text-color-one font-xsmall mt-5 letter-spacing-small page-box box-padding-one border-radius-5 d-flex-all-center`}
                              >
                                Token #{token?.tokenId}
                              </Text>
                            </Flex>
                          </Col>
                        </Row>
                      </Col>
                    );
                  })}
                </>
              ) : (
                <Text
                  className={`text-color-one mt-7 font-small letter-spacing-small box-padding-one border-radius-5 d-flex-all-center`}
                >
                  No tokens found
                </Text>
              )}
            </>
          )}
        </Row>
      ) : (
        <>
          <Row
            className={`margin-bottom ${
              contractTokens === null ? "mt-90" : "mt-30"
            }`}
            justify={contractTokens === null ? "center" : "start"}
            gutter={[32, 32]}
          >
            {contractTokens === null ? (
              <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
            ) : (
              <>
                {contractTokens?.length ? (
                  <>
                    {contractTokens?.map((asset, index) => {
                      const { token } = asset;
                      const { collection } = token;
                      return (
                        <>
                          <Col
                            key={`${token?.tokenId}-${index}-${Math.random()}`}
                            md={4}
                          >
                            <Row
                              className={`border-color-ash pointer border-radius-8 border-padding-medium`}
                            >
                              <Col md={24}>
                                <Flex vertical>
                                  <img
                                    className="border-radius-5"
                                    src={
                                      token?.image ||
                                      "https://i.seadn.io/s/raw/files/b1ee9db8f2a902b373d189f2c279d81d.png?w=500&auto=format"
                                    }
                                    alt="asset_cards"
                                    width={"auto"}
                                  />
                                  <Text
                                    className={`stamp text-color-one mt-7 font-small letter-spacing-small page-box box-padding-one border-radius-5 d-flex-all-center`}
                                  >
                                    {collection?.name}
                                  </Text>
                                  <Text
                                    className={`text-color-one font-small mt-5 letter-spacing-small page-box box-padding-one border-radius-5 d-flex-all-center`}
                                  >
                                    Token #{token?.tokenId}
                                  </Text>
                                </Flex>
                              </Col>
                            </Row>
                          </Col>
                        </>
                      );
                    })}
                  </>
                ) : (
                  <Text
                    className={`text-color-one mt-7 font-small letter-spacing-small box-padding-one border-radius-5 d-flex-all-center`}
                  >
                    No collateral found
                  </Text>
                )}
              </>
            )}
          </Row>
        </>
      )}
    </>
  );
};

export default propsContainer(ActiveLoans);
