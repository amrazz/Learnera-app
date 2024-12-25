import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/store/store.js";
import { PersistGate } from "redux-persist/integration/react";
import { HashLoader } from "react-spinners";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex justify-center items-center h-screen">
            <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
          </div>
        }
        persistor={persistor}
      >
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
