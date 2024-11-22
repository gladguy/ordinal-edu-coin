import { Col, Row, Typography } from "antd";
import { IoCloudDownload } from "react-icons/io5";
import { Link } from "react-router-dom";
import myordinals from "../../assets/logo/ordinalslogo.png";
import metamask from "../../assets/wallet-logo/meta.png";

const WalletUI = ({ isAirdrop, isPlugError }) => {
  const { Text } = Typography;
  const metaLink = process.env.REACT_APP_META;

  return (
    <>
      <Row justify={"center"} className="mt-70">
        <img
          className="egg airdrop_claimed"
          src={myordinals}
          alt="noimage"
          style={{ justifyContent: "center", borderRadius: "25%" }}
          width={80}
        />
      </Row>

      <Row justify={"center"} className="mt-15">
        <Text className="text-color-one font-large font-weight-600">
          {isAirdrop
            ? `Please ${
                isPlugError
                  ? "reconnect wallets"
                  : "connect Plug & Bitcoin wallets"
              }  to continue !`
            : "Download the below wallets !"}
        </Text>
      </Row>

      <Row justify={"center"} align={"middle"} className="mt-7" gutter={10}>
        <Col>
          <Text className="text-color-two font-medium">
            To install wallets, go to portfolio and click download wallets.
          </Text>
        </Col>
        <Col>
          <IoCloudDownload
            style={{ marginTop: "10x" }}
            color="white"
            size={20}
          />
        </Col>
      </Row>

      {!isAirdrop && (
        <Row justify={"center"}>
          <Col md={20}>
            <Row
              justify={"space-evenly"}
              align={"middle"}
              className="mt-20 walletsCard"
            >
              <Col>
                <Link
                  className="iconalignment float-up-medium"
                  target="_blank"
                  to={metaLink}
                >
                  <img
                    src={metamask}
                    alt="logo"
                    className="pointer"
                    width={60}
                  />
                </Link>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    </>
  );
};

export default WalletUI;
