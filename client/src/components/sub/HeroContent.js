import React from "react";
import { motion } from "framer-motion";
import { slideInFromLeft, slideInFromRight, slideInFromTop } from "./motion";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { TypeAnimation } from "react-type-animation";
// import App from "./../../App.css";

const HeroContent = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="flex flex-row items-center justify-center px-20 mt-40 w-full z-[20]"
    >
      <div className="h-full w-full flex flex-col gap-5 justify-center m-auto text-start">
        <motion.div
          variants={slideInFromTop}
          className="Welcome-box py-[8px] px-[4px] border border-[#7042f88b] opacity-[0.9]"
        >
          <SparklesIcon className="text-[#b49bff] mr-[10px] h-5 w-5" />
          <h1 className="Welcome-text text-[13px]">MerkleAirdrop</h1>
        </motion.div>
        <motion.div
          variants={slideInFromLeft(0.5)}
          className="flex flex-col gap-6 lg:text-[50px] font-semibold uppercase leading-[1] text-white "
        >
          Custom
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
            Token Airdrop
          </span>
          <div className=" text-[56px] lg:text-[45px] font-secondary h-[0px] font-semibold uppercase leading-[1] ">
            <span className="mr-4 ">Merkle</span>
            <TypeAnimation
              sequence={["Create Airdrop", 2000, "Claim Airdrop", 2000]}
              speed={50}
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500"
              wapper="span"
              repeat={Infinity}
            />
          </div>
        </motion.div>

        <motion.p
          variants={slideInFromLeft(0.8)}
          className="text-lg text-gray-400 h-[20px] my-7 max-w-[480px]"
        >
          Create single or multiple airdrop with your custom tokens, Automated
          and dynamic Airdrop with multiple ClaimTokens.
        </motion.p>
        <div className="space">
          <motion.a
            variants={slideInFromLeft(0.8)}
            className="btn btn-primary"
            href="/userAirdropData"
          >
            CreateAirdrop
          </motion.a>
        </div>
      </div>
      <motion.div
        variants={slideInFromRight(0.8)}
        className="w-full h-full flex justify-center items-center"
      ></motion.div>
    </motion.div>
  );
};

export default HeroContent;
