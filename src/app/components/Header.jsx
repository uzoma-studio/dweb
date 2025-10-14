"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed w-full z-100 flex items-center justify-between lg:px-8 px-6 py-4 bg-transparent"
    >
      {/* Logo section */}
      <motion.div
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Link
          href="https://grayarea.org/course/dweb/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-4"
        >
          <Image
            src="/GALOGO.svg"
            alt="DWEBB for Creators Logo"
            width={120}
            height={20}
            priority
            className="object-contain w-[120px] h-auto"
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
        {!isLanding && (
          <>
            <Link
              href="/"
              className="flex items-center justify-center px-6 py-2 text-white hover:bg-white/10 transition"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="flex items-center justify-center px-6 py-2 text-white hover:bg-white/10 transition"
            >
              About
            </Link>
          </>
        )}

        {["TWITTER", "FB", "IG", "LINKEDIN"].map((icon, index) => (
          <motion.div
            key={icon}
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: "spring", stiffness: 250 }}
          >
            <Link
              href="/explore-projects"
              className="flex items-center justify-center px-4 py-2 text-white hover:bg-white/10 transition"
            >
              <Image
                src={`/${icon}.svg`}
                alt={`${icon} Icon`}
                width={20}
                height={20}
                className="object-contain w-[20px] h-[20px]"
              />
            </Link>
          </motion.div>
        ))}
      </motion.nav>
    </motion.header>
  );
}
