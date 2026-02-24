"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineCircle } from "react-icons/md";
import { MdCircle } from "react-icons/md";

export default function Header() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

    const socialLinks = {
      TWITTER: "https://x.com/grayareaorg",
      FB: "https://www.facebook.com/GrayArea",
      IG: "https://www.instagram.com/grayareaorg",
      LINKEDIN: "https://www.linkedin.com/company/gray-area-foundation-for-the-arts",
    };

  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-[100] flex items-center justify-between lg:px-8 px-2 py-4 bg-transparent"
    >
      {/* Logo section */}
      <motion.div transition={{ type: "spring", stiffness: 300 }}>
        <Link
          href="/"
          rel="noopener noreferrer"
          className="flex items-center p-2 md:p-4 z-100"
        >
          <Image
            src="/GALOGO.svg"
            alt="DWEBB for Creators Logo"
            width={120}
            height={40}
            priority
            className="object-contain w-[100px] md:w-[120px] h-auto"
          />
        </Link>
      </motion.div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex items-center border border-white rounded-lg divide-x divide-dashed divide-white bg-white/5 backdrop-blur-sm"
      >
        {/* Show only on non-landing pages */}
        {!isLanding && (
              <>
                

              {/* <Link
                  href="/about"
                  className="flex items-center IBMregular justify-center px-2 sm:px-4 py-2 lg:text-sm text-xs text-white hover:bg-white/10 transition"
                >
                  {pathname === "/about" ? (
                    <MdCircle className="pr-1" />
                  ) : (
                    <MdOutlineCircle className="pr-1" />
                  )}
                  <span>About</span>
                </Link> */} 
              </>
            
            )}

    

            {Object.entries(socialLinks).map(([icon, url]) => (
              <motion.div
                key={icon}
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <Link
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-2 lg:px-3 py-2 hover:bg-white/10 transition"
                >
                  <Image
                    src={`/${icon}.svg`}
                    alt={`${icon} Icon`}
                    width={22}
                    height={22}
                    className="object-contain lg:w-[22px] w-[18px] h-auto"
                  />
                </Link>
              </motion.div>
            ))}

      </motion.nav>
    </motion.header>
  );
}
