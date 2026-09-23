import { ArrowDown, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { Product } from '../data/products';
import type { StorefrontContent } from '../services/storefrontApi';

interface HeroProps {
  content?: StorefrontContent['homepage'];
  featuredProduct?: Product;
  onShop: () => void;
  onStory: () => void;
}

const fallbackImages = {
  main: 'https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  detail: 'https://images.unsplash.com/photo-1631125915732-b98f8774f675?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  texture: 'https://images.unsplash.com/photo-1526198049595-f32cde2a219d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
};

export function Hero({ content, featuredProduct, onShop, onStory }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const mainImage = content?.heroImage || featuredProduct?.image || fallbackImages.main;
  const detailImage = content?.heroDetailImage || fallbackImages.detail;
  const textureImage = content?.heroTextureImage || fallbackImages.texture;
  const title = content?.heroTitle || 'Ceramique artisanale tunisienne pour une maison elegante';
  const subtitle =
    content?.heroSubtitle ||
    'Vaisselle, decoration maison et cadeaux faconnes a la main par des artisans tunisiens.';
  const productName = featuredProduct?.name || 'Vase Decoratif';
  const productPrice = featuredProduct?.price || 129;

  return (
    <section className="relative min-h-[calc(100vh-2rem)] overflow-hidden bg-[#EAF3F2] pt-20 lg:pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(7,93,154,0.18),transparent_34%),radial-gradient(circle_at_18%_78%,rgba(184,111,59,0.14),transparent_30%),linear-gradient(120deg,#FFFFFF_0%,#EAF3F2_52%,#E9D8BE_100%)]" />
      <div className="absolute left-0 top-24 h-72 w-72 rounded-full bg-[#075D9A]/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1400px] items-center px-6 py-8 lg:min-h-[calc(100vh-7rem)] lg:px-12 lg:py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl space-y-6 lg:space-y-8"
          >
            <div className="space-y-5">
              <h1 className="text-4xl font-serif leading-[1.04] tracking-normal text-[#17324D] sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[0.98]">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-[#5E6F73] lg:text-xl lg:leading-8">{subtitle}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4 rounded-2xl border border-white/70 bg-white/55 p-3 shadow-[0_18px_45px_rgba(23,50,77,0.12)] backdrop-blur-md md:hidden"
            >
              <img src={mainImage} alt={productName} className="h-24 w-24 flex-none rounded-xl object-cover" />
              <div className="min-w-0">
                <h3 className="font-serif text-xl leading-tight text-[#17324D]">{productName}</h3>
                <p className="mt-1 text-sm text-[#5E6F73]">{productPrice} DT</p>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onShop}
                className="group flex items-center justify-center gap-2 rounded-full bg-[#075D9A] px-8 py-3.5 text-white shadow-[0_18px_45px_rgba(7,93,154,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#B86F3B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075D9A] focus-visible:ring-offset-4 focus-visible:ring-offset-[#EAF3F2] lg:py-4"
              >
                <span>{content?.heroPrimaryCta || 'Decouvrir la boutique'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={onStory}
                className="rounded-full border border-[#5E6F73]/30 bg-white/35 px-8 py-3.5 text-[#5E6F73] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#5E6F73]/50 hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075D9A] focus-visible:ring-offset-4 focus-visible:ring-offset-[#EAF3F2] lg:py-4"
              >
                {content?.heroSecondaryCta || 'Notre histoire'}
              </button>
            </div>

            <div className="hidden max-w-xl grid-cols-3 gap-4 border-t border-[#5E6F73]/15 pt-6 text-sm text-[#5E6F73] sm:grid">
              <div className="space-y-1">
                <div className="font-serif text-2xl text-[#075D9A]">500+</div>
                <div>Pieces uniques</div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-2xl text-[#075D9A]">100%</div>
                <div>Fait main</div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-2xl text-[#075D9A]">Tunis</div>
                <div>Atelier tunisien</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-[520px] lg:min-h-[650px]"
            style={{ perspective: 1200 }}
          >
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      y: [0, -10, 0],
                      rotateX: [0, 1.5, 0],
                      rotateY: [-2, 2, -2],
                    }
              }
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-[8%] top-[7%] h-[78%] w-[76%] rounded-[2rem] bg-white/60 p-4 shadow-[0_40px_100px_rgba(23,50,77,0.18)] backdrop-blur-xl lg:left-[12%]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img src={mainImage} alt={productName} className="h-full w-full rounded-[1.45rem] object-cover" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30, rotate: 4 }}
              animate={{ opacity: 1, x: 0, rotate: 4 }}
              transition={{ duration: 0.9, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-0 hidden h-48 w-36 overflow-hidden rounded-[1.4rem] border border-white/60 bg-white shadow-[0_24px_60px_rgba(23,50,77,0.14)] md:block lg:h-56 lg:w-44"
            >
              <img src={detailImage} alt="Product detail" className="h-full w-full object-cover" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30, rotate: -5 }}
              animate={{ opacity: 1, x: 0, rotate: -5 }}
              transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-10 left-0 h-44 w-36 overflow-hidden rounded-[1.4rem] border border-white/60 bg-white shadow-[0_24px_60px_rgba(23,50,77,0.13)] md:h-52 md:w-44"
            >
              <img src={textureImage} alt="Ceramic texture" className="h-full w-full object-cover" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.58, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-4 right-4 w-[min(82%,360px)] rounded-2xl border border-white/70 bg-[#F8FBFA]/86 p-5 shadow-[0_24px_70px_rgba(23,50,77,0.15)] backdrop-blur-xl"
            >
              <div className="flex items-end justify-between gap-5">
                <div>
                  <h3 className="font-serif text-2xl leading-tight text-[#17324D]">{productName}</h3>
                  <p className="mt-1 text-sm text-[#5E6F73]">{featuredProduct?.category || 'Collection'}</p>
                </div>
                <span className="font-serif text-2xl text-[#075D9A]">{productPrice} DT</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-sm text-[#5E6F73] md:flex"
      >
        <span>Decouvrir</span>
        <ArrowDown className="h-4 w-4" />
      </motion.div>
    </section>
  );
}
