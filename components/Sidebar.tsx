"use client";

import { avatarPlaceholderUrl, navItems } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = ({name, email}:{name:string , email:string}) => {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/">
        <Image
          src="/assets/icons/main.svg"
          alt="logo"
          width={160}
          height={50}
          className="hidden h-auto lg:block"
        />
        <Image
          src="assets/icons/main-half.svg"
          alt="logo"
          width={52}
          height={52}
          className="lg:hidden"
        />
      </Link>

      <nav className="sidebar-nav">
        <ul className="flex flex-1 flex-col gap-6">
          {navItems.map(({ url, name, icon }) => {
            return (
              <Link href={url} key={name} className=" lg:w-full">
                <li
                  className={cn(
                    "sidebar-nav-item",
                    pathname === url && "shad-active"
                  )}
                >
                  <Image
                    src={icon}
                    alt={name}
                    width={24}
                    height={24}
                    className={cn(
                      "nav-icon",
                      pathname === url && "nav-icon-active"
                    )}
                  />
                  <p className=" hidden lg:block">{name}</p>
                </li>
              </Link>
            );
          })}
        </ul>
      </nav>

      <Image
        src="/assets/images/illustrations.png"
        alt="logo"
        width={150}
        height={200}
        className="w-full"
      />

      <div className="sidebar-user-info">
        <Image
          src={avatarPlaceholderUrl}
          alt="avatar"
          width={44}
          height={44}
          className="sidebar-user-avatar"
        />

        <div className=" hidden lg:block">
          <p className=" subtitle-2 capitalize">
            {name}
          </p>
          <p className="caption">
            {email}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
