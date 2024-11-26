import { Actor, HttpAgent } from "@dfinity/agent";
import axios from "axios";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Notify from "../../component/notification";
import {
  setAgent,
  setAllBorrowRequest,
  setApprovedCollection,
  setApprovedCollectionObj,
  setBorrowCollateral,
  setChainValue,
  setCoinValue,
  setUserAssets,
  setUserCollateral,
} from "../../redux/slice/constant";
import borrowJson from "../../utils/borrow_abi.json";
import {
  API_METHODS,
  BorrowContractAddress,
  CHAIN_POLYGON,
  TokenContractAddress,
  apiUrl,
  calculateAPY,
  custodyAddress,
  opencampusCanister,
} from "../../utils/common";
import tokenAbiJson from "../../utils/tokens_abi.json";
import { openCampusApiFactory } from "../../opencampus_canister";

export const propsContainer = (Component) => {
  function ComponentWithRouterProp(props) {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const reduxState = useSelector((state) => state);
    const chain = reduxState.wallet.chain;
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

    const chainPrice = async () => {
      let url;
      if (chain === CHAIN_POLYGON) {
        url = `https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd`;
      } else {
        url = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`;
      }
      const chainData = await API_METHODS.get(url);
      return chainData;
    };

    const fetchChainLiveValue = async () => {
      try {
        const chainData = await chainPrice();
        if (chainData.data["matic-network"]) {
          const ChainValue = chainData.data["matic-network"].usd;
          dispatch(setChainValue(ChainValue));
        } else {
          // chainPrice();
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

            const agent = Actor.createActor(openCampusApiFactory, {
              agent: ordinalAgent,
              canisterId: opencampusCanister,
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
          if (ckBtcAgent) fetchChainLiveValue();
        }, [300000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    useEffect(() => {
      (async () => {
        if (api_agent) {
          const approvedCollections =
            await api_agent.getApprovedCollectionsByChain(chain);
          // approvedCollections = [
          //   "fewoworld-flowers",
          //   "discord-utility-scam-ep-2",
          //   "snow-bears",
          //   "web3-identity-crisis",
          //   "checkpunks",
          //   "goblintownhelix",
          //   "oreraid",
          //   "everybodys",
          //   "moongirls-emanuele-ferrari",
          //   // "wonderful-composition-with-grids",
          //   // "etherpolice-origin",
          //   // "akutar-accessories",
          //   // "end-of-sartoshi",
          //   // "egglins-xyz",
          //   // "thebunnyisland"
          // ];
          if (approvedCollections.length) {
            const collectionPromise = approvedCollections.map(
              async (collection) => {
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
              }
            );

            const collectionDetails = await Promise.all(collectionPromise);
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

            let collectionObj = {};
            finalResult.forEach((col) => {
              collectionObj[col.id] = col;
            });
            dispatch(setApprovedCollection(finalResult));
            dispatch(setApprovedCollectionObj(collectionObj));
          }
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    const getCollaterals = async () => {
      try {
        const options = {
          method: "GET",
          url: `${apiUrl.Asset_server_base_url}/api/v1/token/activity/${custodyAddress}?chain=${chain}`,
        };

        const result = await axios.request(options);

        // Step 1: Filter for transfer type activities
        const transfers = result.data.activities.filter(
          (activity) => activity.type === "transfer"
        );

        // Step 2: Group by tokenId and sort by timestamp descending
        const grouped = transfers.reduce((acc, activity) => {
          const tokenId = activity.token.tokenId;
          if (!acc[tokenId]) acc[tokenId] = [];
          acc[tokenId].push(activity);
          return acc;
        }, {});

        // Sort each tokenId group by timestamp descending
        Object.keys(grouped).forEach((tokenId) => {
          grouped[tokenId].sort((a, b) => b.timestamp - a.timestamp);
        });

        // Step 3: Extract the latest activity per tokenId
        const latestActivities = Object.entries(grouped).reduce(
          (acc, [tokenId, activities]) => {
            const latestActivity = activities[0]; // The first item is the latest after sorting
            // Step 4: Check if latest activity matches the constraints
            if (
              latestActivity.fromAddress.toLowerCase() ===
                metaAddress.toLowerCase() &&
              latestActivity.toAddress.toLowerCase() ===
                custodyAddress.toLowerCase()
            ) {
              acc[tokenId] = latestActivity;
            }
            return acc;
          },
          {}
        );

        try {
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

          const finalData = Object.values(latestActivities).map((asset) => {
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

          const borrowCollateral = finalData.filter((asset) => asset.isToken);

          dispatch(setBorrowCollateral(borrowCollateral));
          dispatch(setUserCollateral(finalData));
        } catch (error) {
          if (
            error.message.includes("No NFT found") ||
            error.message.includes("No single NFT has been minted yet")
          ) {
            const finalData = Object.values(latestActivities).map((asset) => {
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
          `https://api.coingecko.com/api/v3/simple/price?ids=edu-coin&vs_currencies=usd`
        );
        if (coinData.data["edu-coin"]) {
          const coinValue = coinData.data["edu-coin"].usd;
          dispatch(setCoinValue(coinValue));
        } else {
          // fetchCoinPrice();
          // dispatch(setCoinValue(0.51));
        }
      } catch (error) {
        // Notify("error", "Failed to fetch Aptos");
      }
    };

    const fetchUserAssets = async (address) => {
      let config = {
        method: "GET",
        url: `${apiUrl.Asset_server_base_url}/api/v1/user/tokens/${
          address ? address : metaAddress
        }?chain=${chain}`,
      };

      try {
        const response = await axios.request(config);

        const isSpamFilter = response.data.tokens.filter(
          (collection) => !collection.token.collection.isSpam
        );

        const result = isSpamFilter.map((collection) => {
          return {
            ...collection.token,
          };
        });

        if (address) {
          return result;
        } else {
          dispatch(setUserAssets(result));
        }
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      (() => {
        setInterval(async () => {
          fetchCoinPrice();
        }, [30000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    useEffect(() => {
      (() => {
        setInterval(async () => {
          fetchChainLiveValue();
        }, [30000]);
        return () => clearInterval();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api_agent, dispatch]);

    useEffect(() => {
      if (activeWallet.length && !userAssets && chain) {
        fetchUserAssets();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWallet, collections, metaAddress]);

    useEffect(() => {
      if (
        activeWallet.length &&
        approvedCollections[0] &&
        !borrowCollateral.length &&
        userAssets &&
        chain
      ) {
        getCollaterals();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWallet, approvedCollections, userAssets, chain]);

    useEffect(() => {
      if (activeWallet.length) {
        getAllBorrowRequests();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWallet]);

    useEffect(() => {
      //Fetching BTC Value
      fetchChainLiveValue();

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
          fetchUserAssets,
          getAllBorrowRequests,
        }}
      />
    );
  }
  return ComponentWithRouterProp;
};
