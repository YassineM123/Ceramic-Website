import { motion } from 'motion/react';

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-[#F8FBFA] z-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-[#E9D8BE] border-t-[#075D9A] rounded-full mx-auto"
        />
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-[#17324D]">Le Monde Céramique</h3>
          <p className="text-[#5E6F73]">Chargement...</p>
        </div>
      </div>
    </div>
  );
}
