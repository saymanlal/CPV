'use client';

import { motion } from 'framer-motion';

type StatusCardProps = {
  label: string;
  value: string;
  hint: string;
};

export const StatusCard = ({ label, value, hint }: StatusCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur"
    >
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{hint}</p>
    </motion.div>
  );
};
