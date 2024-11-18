import { Actor, HttpAgent } from "@dfinity/agent";
import axios from "axios";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Notify from "../../component/notification";
import { apiFactory } from "../../ordinal_canister";
import {
  setAgent,
  setAllBorrowRequest,
  setApprovedCollection,
  setApprovedCollectionObj,
  setBorrowCollateral,
  setCoinValue,
  setEthValue,
  setUserAssets,
  setUserCollateral,
} from "../../redux/slice/constant";
import borrowJson from "../../utils/borrow_abi.json";
import {
  API_METHODS,
  BorrowContractAddress,
  IS_DEV,
  IS_USER,
  TokenContractAddress,
  calculateAPY,
  custodyAddress,
  ordinals,
} from "../../utils/common";
import tokenAbiJson from "../../utils/tokens_abi.json";

export const propsContainer = (Component) => {
  function ComponentWithRouterProp(props) {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const reduxState = useSelector((state) => state);
    const activeWallet = reduxState.wallet.active;
    const metaAddress = reduxState.wallet.meta.address;
    const api_agent = reduxState.constant.agent;
    const collections = reduxState.constant.collection;
    const approvedCollections = reduxState.constant.approvedCollections;
    const userAssets = reduxState.constant.userAssets;
    const borrowCollateral = reduxState.constant.borrowCollateral;
    const ckBtcAgent = reduxState.constant.ckBtcAgent;
    const ckBtcActorAgent = reduxState.constant.ckBtcActorAgent;
    const ckEthAgent = reduxState.constant.ckEthAgent;
    const ckEthActorAgent = reduxState.constant.ckEthActorAgent;
    const withdrawAgent = reduxState.constant.withdrawAgent;
    const coinValue = reduxState.constant.coinValue;
    const ethvalue = reduxState.constant.ethvalue;

    const [isEthConnected, setIsEthConnected] = useState(false);

    useEffect(() => {
      if (activeWallet.length) {
        (async () => {
          try {
            const isConnected = await window.ethereum.isConnected();
            setIsEthConnected(isConnected);
          } catch (error) {
            console.log("error eth isConnected", error);
          }
        })();
      }
    }, [activeWallet.length]);

    const ethPrice = async () => {
      const ethData = await API_METHODS.get(
        `${process.env.REACT_APP_COINGECKO_API}?ids=${process.env.REACT_APP_BTC_TICKER}&vs_currencies=usd`
      );
      return ethData;
    };

    const fetchETHLiveValue = async () => {
      try {
        const ethData = await ethPrice();
        if (ethData.data["ethereum"]) {
          const EthValue = ethData.data["ethereum"].usd;
          dispatch(setEthValue(EthValue));
        } else {
          fetchETHLiveValue();
        }
      } catch (error) {
        // Notify("error", "Failed to fetch ckBtc");
      }
    };

    useEffect(() => {
      (async () => {
        try {
          if (!api_agent) {
            const ordinalAgent = new HttpAgent({
              host: process.env.REACT_APP_HTTP_AGENT_ACTOR_HOST,
            });

            const agent = Actor.createActor(apiFactory, {
              agent: ordinalAgent,
              canisterId: ordinals,
            });

            dispatch(setAgent(agent));
          }
        } catch (error) {
          Notify("error", error.message);
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
      (() => {
        setInterval(async () => {
          if (ckBtcAgent) fetchETHLiveValue();
        }, [300000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    useEffect(() => {
      (async () => {
        // if (api_agent) {
        //   const result = await api_agent.get_collections();
        //   const approvedCollections = await api_agent.getApproved_Collections();
        //   const collections = JSON.parse(result);
        //   if (approvedCollections.length) {
        const approvedCollections = [
          "fewoworld-flowers",
          "discord-utility-scam-ep-2",
          "snow-bears",
          "web3-identity-crisis",
          "checkpunks",
          "goblintownhelix",
          "oreraid",
          "everybodys",
          "moongirls-emanuele-ferrari",
          "wonderful-composition-with-grids",
          "etherpolice-origin",
          "akutar-accessories",
          "end-of-sartoshi",
          "egglins-xyz",
          "thebunnyisland",
          // "degen-goblins",
          // "akutar-mint-pass",
          // "precious-baby-phepes",
          // "kongclub-official",
          // "zombiefrens",
          // "gladguy-collection",
          // "uae-nft-from-desert-to-mars-thomas-dubois",
        ];
        const collectionPromise = approvedCollections.map(
          async (collection) => {
            return new Promise(async (resolve) => {
              const options = {
                method: "GET",
                url: `${process.env.REACT_APP_MAGICEDEN_API}/v3/rtp/ethereum/collections/v7?slug=${collection}`,
                headers: {
                  accept: "*/*",
                  Authorization: process.env.REACT_APP_MAGICEDEN_BEARER,
                },
              };
              axios
                .request(options)
                .then((response) => {
                  resolve(...response.data.collections);
                })
                .catch((error) => {
                  console.log(error);
                });
            });
          }
        );

        const collectionDetails = await Promise.all(collectionPromise);
        const finalResult = collectionDetails.map((col) => {
          // const { yield: yields, terms } = col;
          const term = 7;
          const APY = calculateAPY(5, term);
          const LTV = 0;
          return {
            ...col,
            terms: term,
            APY,
            LTV,
          };
        });
        console.log("finalResult", finalResult);
        let collectionObj = {};
        finalResult.forEach((col) => {
          collectionObj[col.slug] = col;
        });
        dispatch(setApprovedCollection(finalResult));
        dispatch(setApprovedCollectionObj(collectionObj));
        // }
        // dispatch(setCollection(collections));
        // }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    const getCollaterals = async () => {
      try {
        const options = {
          method: "GET",
          url: `${process.env.REACT_APP_MAGICEDEN_API}/v3/rtp/polygon/users/activity/v6?users=${custodyAddress}&limit=20&sortBy=eventTimestamp&includeMetadata=true`,
          headers: {
            accept: "*/*",
            Authorization: process.env.REACT_APP_MAGICEDEN_BEARER,
          },
        };

        const result = await axios.request(options);
        const activities = result.data.activities.filter(
          (activity) => activity.type === "transfer"
        );
        console.log("activities", activities);

        const userActivity = activities.filter(
          (activity) =>
            activity.fromAddress.toLowerCase() === metaAddress.toLowerCase() &&
            activity.toAddress.toLowerCase() === custodyAddress.toLowerCase()
        );
        const uniqueTokens = userActivity.reduce((map, item) => {
          const { tokenId } = item.token;
          // If tokenId doesn't exist in map or the current item's timestamp is more recent
          if (!map[tokenId] || map[tokenId].timestamp < item.timestamp) {
            map[tokenId] = item; // Update with the more recent entry
          }
          return map;
        }, {});
        try {
          // const API = agentCreator(rootstockApiFactory, rootstock);
          // const userAssets = await API.getUserSupply(
          //   IS_USER ? address : WAHEED_ADDRESS
          // );
          // const supplyData = userAssets.map((asset) => JSON.parse(asset));
          // colResult = await getCollectionDetails(supplyData);
          // --------------------------------------------------

          // console.log(Object.values(uniqueTokens));
          // setEthAssets(Object.values(uniqueTokens));

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            TokenContractAddress,
            tokenAbiJson,
            signer
          );

          const loanContract = new ethers.Contract(
            BorrowContractAddress,
            borrowJson,
            signer
          );

          const tokens = await contract.tokensOfOwner(metaAddress);
          const userRequest = await loanContract.getBorrowRequestsByUser(
            metaAddress
          );

          const userMintedTokens = tokens.map((token) =>
            Number(token.toString())
          );

          const userRequestTokens = userRequest.map((req) => {
            return {
              tokenId: Number(req.tokenId),
              borrower: req.borrower,
              tokenAddress: req.tokenAddress,
              createdAt: Number(req.createdAt),
              duration: Number(req.duration),
              isActive: req.isActive,
              loanAmount: Number(req.loanAmount),
              nftContract: req.nftContract,
              platformFee: Number(req.platformFee),
              repayAmount: Number(req.repayAmount),
              requestId: Number(req.requestId),
            };
          });

          // const finalData = userAssets.map((asset) => {
          //   const req = userRequestTokens.find(
          //     (req) => req.tokenId === Number(asset.tokenId)
          //   );

          //   return {
          //     ...asset,
          //     isToken: userMintedTokens.includes(Number(asset.tokenId))
          //       ? true
          //       : false,
          //     isBorrowRequest: req ? true : false,
          //   };
          // });

          const finalData = Object.values(uniqueTokens).map((asset) => {
            const req = userRequestTokens.find(
              (req) => req.tokenId === Number(asset.token.tokenId)
            );

            return {
              ...asset,
              isToken: userMintedTokens.includes(Number(asset.token.tokenId))
                ? true
                : false,
              isBorrowRequest: req ? true : false,
            };
          });
          console.log("finaldata", finalData);

          const borrowCollateral = finalData.filter((asset) => asset.isToken);

          dispatch(setBorrowCollateral(borrowCollateral));
          dispatch(setUserCollateral(finalData));
        } catch (error) {
          if (
            error.message.includes("No NFT found") ||
            error.message.includes("No single NFT has been minted yet")
          ) {
            const finalData = Object.values(uniqueTokens).map((asset) => {
              return {
                ...asset,
                isToken: [].includes(Number(asset.tokenId)) ? true : false,
              };
            });
            dispatch(setBorrowCollateral([]));
            dispatch(setUserCollateral(finalData));
          } else {
            console.log("Collateral fetching error", error.message);
          }
        }
      } catch (error) {}
    };

    const getAllBorrowRequests = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const borrowContract = new ethers.Contract(
          BorrowContractAddress,
          borrowJson,
          signer
        );
        const activeReq = await borrowContract.getActiveBorrowRequests();
        const userActiveRequest = activeReq.map((req) => {
          return {
            tokenId: Number(req.tokenId),
            borrower: req.borrower,
            tokenAddress: req.tokenAddress.toLowerCase(),
            createdAt: Number(req.createdAt),
            duration: Number(req.duration),
            isActive: req.isActive,
            loanAmount: Number(req.loanAmount),
            nftContract: req.nftContract,
            platformFee: Number(req.platformFee),
            repayAmount: Number(req.repayAmount),
            requestId: Number(req.requestId),
          };
        });

        dispatch(setAllBorrowRequest(userActiveRequest));
      } catch (error) {
        console.log("fetching all borrow request error", error);
      }
    };

    const fetchCoinPrice = async () => {
      try {
        const coinData = await API_METHODS.get(
          `${process.env.REACT_APP_COINGECKO_API}?ids=${process.env.REACT_APP_COIN_TICKER}&vs_currencies=usd`
        );

        if (coinData.data["edu-coin"]) {
          const coinValue = coinData.data["edu-coin"].usd;
          dispatch(setCoinValue(coinValue));
        } else {
          fetchCoinPrice();
        }
      } catch (error) {
        // Notify("error", "Failed to fetch Aptos");
      }
    };

    useEffect(() => {
      (() => {
        setInterval(async () => {
          fetchCoinPrice();
        }, [300000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    useEffect(() => {
      console.log("COND", activeWallet.length && !userAssets);

      if (activeWallet.length && !userAssets) {
        let config = {
          method: "get",
          url: `${process.env.REACT_APP_MAGICEDEN_API}/v3/rtp/${
            IS_DEV ? "polygon" : "ethereum"
          }/users/${
            IS_USER ? metaAddress : "0xE98b997f529F643Bc67F217B1270A0F7D7a0EcB2"
          }/tokens/v7?normalizeRoyalties=false&sortBy=acquiredAt&sortDirection=desc&limit=200&includeTopBid=false&includeAttributes=false&includeLastSale=false&includeRawData=false&filterSpamTokens=false&useNonFlaggedFloorAsk=false`,
          headers: {
            Authorization: process.env.REACT_APP_MAGICEDEN_BEARER,
          },
        };

        axios
          .request(config)
          .then((response) => {
            const isSpamFilter = response.data.tokens.filter(
              (collection) => !collection.token.collection.isSpam
            );
            console.log("isSpamFilter", isSpamFilter);

            const result = isSpamFilter.map((collection) => {
              return {
                ...collection.token,
              };
            });
            dispatch(setUserAssets(result));
          })
          .catch((error) => {
            console.log(error);
          });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWallet, collections, metaAddress]);

    useEffect(() => {
      if (
        activeWallet.length &&
        approvedCollections[0] &&
        !borrowCollateral.length &&
        userAssets
      ) {
        getCollaterals();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWallet, approvedCollections, userAssets]);

    useEffect(() => {
      if (activeWallet.length) {
        getAllBorrowRequests();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWallet]);

    useEffect(() => {
      //Fetching BTC Value
      fetchETHLiveValue();

      fetchCoinPrice();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Component
        {...props}
        router={{ location, navigate, params }}
        redux={{ dispatch, reduxState }}
        wallet={{
          api_agent,
          ckBtcAgent,
          ckEthAgent,
          withdrawAgent,
          isEthConnected,
          ckBtcActorAgent,
          ckEthActorAgent,
          getCollaterals,
          getAllBorrowRequests,
        }}
      />
    );
  }
  return ComponentWithRouterProp;
};
