import { motion } from 'motion/react';

export function AnnouncementBar() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-10 bg-gradient-to-r from-[#075D9A] to-[#B86F3B] text-white overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto h-full px-6 lg:px-12">
        <div className="flex h-full items-center justify-center text-center">
          <span className="truncate text-xs sm:text-sm">
            Livraison offerte dès 199 TND · الدفع عند الاستلام في تونس
          </span>
        </div>
      </div>
    </motion.div>
  );
}
