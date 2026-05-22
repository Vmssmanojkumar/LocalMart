import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageOff } from "lucide-react";

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide" | string;
  fallbackSrc?: string;
  className?: string;
  enableHoverScale?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  aspectRatio = "square",
  fallbackSrc = "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=600&q=75&auto=format",
  className = "",
  enableHoverScale = false,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState("");
  const [isInViewport, setIsInViewport] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Get Aspect Ratio CSS Class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      case "portrait":
        return "aspect-[3/4]";
      case "wide":
        return "aspect-[16/10]";
      default:
        return "aspect-square";
    }
  };

  // 2. Parse and optimize image URLs via CDN (Unsplash parameters optimization)
  const getOptimizedUrl = (originalUrl: string, width: number, quality = 75) => {
    if (!originalUrl) return fallbackSrc;
    
    // If it is an Unsplash image, we inject dynamic crop, format and sizing parameters
    if (originalUrl.includes("unsplash.com")) {
      try {
        const urlObj = new URL(originalUrl);
        // Clear old sizing parameters
        urlObj.searchParams.delete("w");
        urlObj.searchParams.delete("h");
        urlObj.searchParams.delete("q");
        
        // Add optimized parameters
        urlObj.searchParams.set("w", width.toString());
        urlObj.searchParams.set("q", quality.toString());
        urlObj.searchParams.set("auto", "format"); // Automatically serve modern formats (WebP/AVIF)
        urlObj.searchParams.set("fit", "crop");
        
        return urlObj.toString();
      } catch (e) {
        return `${originalUrl}&w=${width}&q=${quality}&auto=format`;
      }
    }
    return originalUrl;
  };

  // 3. Lazy Loading using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px 0px", // Trigger loading 200px before coming into viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 4. Update source when in viewport or source changes
  useEffect(() => {
    if (!isInViewport) return;

    // Use responsive sizing: check screen width for optimal image size
    const screenWidth = window.innerWidth;
    let targetWidth = 600;
    if (screenWidth < 640) {
      targetWidth = 400; // Small mobile screens
    } else if (screenWidth > 1200) {
      targetWidth = 800; // Desktop high-res cards
    }

    setCurrentSrc(getOptimizedUrl(src, targetWidth));
  }, [src, isInViewport]);

  // 5. Retry / Fallback Logic
  const handleImageError = () => {
    if (errorCount === 0) {
      // First retry with original URL (bypass optimizations)
      setErrorCount(1);
      setCurrentSrc(src);
    } else if (errorCount === 1) {
      // Second fallback to premium preset image
      setErrorCount(2);
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-gray-50/70 select-none ${getAspectRatioClass()} ${className}`}
      style={{ transform: "translateZ(0)" }} // GPU accelerated transforms
    >
      {/* ═══════════════ SKELETON / BLUR SHIMMER ═══════════════ */}
      <AnimatePresence>
        {!isLoaded && errorCount < 2 && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-50 shimmer"
          >
            {/* Embedded progressive low-res blurred thumbnail for seamless blur-up */}
            {src.includes("unsplash.com") && (
              <img
                src={getOptimizedUrl(src, 30, 20)} // Tiny 30px ultra-compressed blurred placeholder
                alt="blur-placeholder"
                className="absolute inset-0 h-full w-full object-cover blur-xl opacity-60 scale-105 pointer-events-none"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ PREMIUM FALLBACK UI ═══════════════ */}
      {errorCount >= 2 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-1.5 p-3">
          <ImageOff className="h-6 w-6 stroke-[1.5]" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
            Image Unreachable
          </span>
        </div>
      )}

      {/* ═══════════════ OPTIMIZED FULL RESOLUTION IMAGE ═══════════════ */}
      {isInViewport && errorCount < 2 && (
        <img
          src={currentSrc}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
          className={`h-full w-full object-cover select-none pointer-events-none transition-all duration-500 ease-out will-change-[transform,opacity] ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${enableHoverScale ? "scale-105" : "scale-100"}`}
          {...props}
        />
      )}
    </div>
  );
}
