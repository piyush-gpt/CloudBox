"use server";

import Card from "@/components/Card";
import Sort from "@/components/Sort";
import { getTotalFileSize } from "@/lib/actions/files.actions";
import { convertFileSize, getFileTypesParams } from "@/lib/utils";

import { IFiles } from "@/models/Files";
import { apiConnector } from "@/utils/apiconnector";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const page = async ({ searchParams,params }: SearchParamProps) => {
  const type = (await params).type;
  const searchText=((await searchParams)?.query as string) || " ";
  const sortText=((await searchParams)?.sort as string) || " ";

  let files = [];
  let size=0;
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    redirect("/sign-in");
  } else {
    try {
      const types = getFileTypesParams(type) as FileType[];
      const response = await apiConnector("POST", "/api/getFiles", {
        token,
        types,
        searchText, sortText
      });
      if (response.status === 200) {
        files = response.data.files;
      }
       size=await getTotalFileSize(token,type);
    } catch (e) {
      console.log("Error occured while fetching file:", e);
    }
  }
  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{convertFileSize(size)}</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden sm:block text-light-200">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>

      {files.length > 0 ? (
        <section className="file-list">
          {files.map((file: IFiles) => (
            <Card key={file._id.toString()} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}
    </div>
  );
};

export default page;
