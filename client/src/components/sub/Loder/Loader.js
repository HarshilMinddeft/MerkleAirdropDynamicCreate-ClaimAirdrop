import React from "react";
import { Hourglass } from "react-loader-spinner";
import "./Loder.css";
const Loader = () => {
  return (
    <div
      className="loderpadding"
      style={
        {
          // display: "flex",
          // flexDirection: "column",
          // justifyContent: "left",
          // alignItems: "center",
        }
      }
    >
      <div className="items">
        <h2 className="texts">Creating</h2>
        <div className="loader">
          <Hourglass
            visible={true}
            height="60"
            width="60"
            ariaLabel="hourglass-loading"
            wrapperStyle={{}}
            wrapperClass=""
            colors={["red", "yellow"]}
          />
        </div>
        <h2 className="texts2">Airdrop</h2>
      </div>
    </div>
  );
};

export default Loader;
