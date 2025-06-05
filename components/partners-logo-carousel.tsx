import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface LogoCarouselProps {
  className?: string;
}

const logos = [
  {
    src: "/Meta_Platforms_Inc._logo.svg.png",
    alt: "Meta Logo",
    width: 90,
    height: 40
  },
  {
    src: "/OpenAI_Logo.svg.png",
    alt: "OpenAI Logo",
    width: 110,
    height: 40
  },
  {
    src: "/WhatsApp.svg.png",
    alt: "WhatsApp Logo",
    width: 100,
    height: 40
  },
];

export default function PartnersLogoCarousel({ className }: LogoCarouselProps) {
  const [currentLogo, setCurrentLogo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length);
    }, 3000); // Change logo every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex justify-evenly items-center gap-4 sm:gap-8 py-5 ${className || ""}`}>
      {logos.map((logo, index) => (
        <motion.div
          key={index}
          className="relative flex justify-center items-center h-16 transition-all duration-500"
          animate={{
            opacity: currentLogo === index ? 1 : 0.85,
            scale: currentLogo === index ? 1.05 : 0.95,
          }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ position: "relative", width: `${logo.width}px`, height: `${logo.height}px` }}>
            <Image
              src={logo.src}
              alt={logo.alt}
              fill
              sizes="100%"
              style={{ 
                objectFit: "contain",
                filter: `brightness(${currentLogo === index ? 1.2 : 1.1}) contrast(${currentLogo === index ? 1.1 : 1})${currentLogo !== index ? " grayscale(25%)" : ""}`,
              }}
              priority
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
} 