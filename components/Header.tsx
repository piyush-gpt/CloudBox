import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Search from "./Search";
import FileUploader from "./FileUploader";
import { handlelogout } from "@/lib/actions/user.actions";

const Header = ({accountId,ownerId}:{accountId:string, ownerId:string}) => {
  return (
    <header className=" header">
      <Search />
      <div className="header-wrapper">
        <FileUploader accountId={accountId} ownerId={ownerId}/>
        <form action={async ()=>{
          'use server'

          await handlelogout();
        }}>
          <Button type="submit" className="sign-out-button" >
            <Image
              src="/assets/icons/logout.svg"
              alt="signout"
              width={24}
              height={24}
              className="w-6"
            />
          </Button>
        </form>
      </div>
    </header>
  );
};

export default Header;
