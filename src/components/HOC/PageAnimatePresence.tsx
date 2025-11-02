'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, AnimatePresenceProps, motion } from 'framer-motion';
import FrozenRoute from './FrozenRoute';
import React from 'react';

interface AnimationPresence extends AnimatePresenceProps {
  children: React.ReactNode;
  customKey?: string;
}

const PageAnimatePresence = (props: AnimationPresence) => {
  const pathnameFromHook = usePathname() || '';
  const pathname = props.customKey || pathnameFromHook;

  return (
    <AnimatePresence mode={props.mode || 'wait'} {...props}>
      <motion.div key={pathname}>
        <FrozenRoute>{props.children}</FrozenRoute>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageAnimatePresence;
