import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import LoadingWrapper from "../component/loading-wrapper";
import store, { persistor } from "../redux/store";
import "./../App.css";
import MainLayout from "./layout";
import { initJuno } from "@junobuild/core";

const App = () => {
  useEffect(() => {
    (async () =>
      await initJuno({
        satelliteId: "aa25u-wiaaa-aaaal-arrgq-cai",
      }))();
  }, []);

  return (
    <React.Fragment>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <LoadingWrapper>
            <Router>
              <MainLayout />
            </Router>
          </LoadingWrapper>
        </PersistGate>
      </Provider>
    </React.Fragment>
  );
};

export default App;
