import { motion } from "framer-motion";
import Link from "next/link";

import { LogoGoogle, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <VercelIcon />
          <span>+</span>
          <MessageIcon />
        </p>
        <p>
          Welcome to the Crypto Research Assistant. Ask me about blockchain
          protocols, market analysis, token metrics, and industry trends.
        </p>
        <ul className="list-disc pl-4 space-y-2">
          <li>"Analyze ETH's tokenomics and staking metrics"</li>
          <li>"Compare Layer 2 scaling solutions: Arbitrum vs Optimism"</li>
          <li>"What are the key trends in DeFi lending protocols?"</li>
          <li>"Explain the impact of Bitcoin halving on market dynamics"</li>
        </ul>
        <p>Get started with your crypto research question!</p>
      </div>
    </motion.div>
  );
};
