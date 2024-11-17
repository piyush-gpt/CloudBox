import { IFiles } from "@/models/Files";
import Link from "next/link";
import React from "react";
import Thumbnail from "./Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";
import { ActionDropDown } from "./ActionDropDown";

const Card = ({ file }: { file: any }) => {
  return (
    <Link href={file.url} target="_blank" className="file-card">
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
          imageClassName="!size-11"
        />

        <div className="flex flex-col items-end justify-between ">
          <ActionDropDown file={file}/>
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>
      <div className="file-card-details">
        <p className="subtitle-2 line-clamp-1">{`${file.name}${"."}${file.extension}`}</p>
        <FormattedDateTime date={file._id} className="body-2 text-light-100"/>
        <p className="caption line-clamp-1 text-light-200"> By:{file.ownerId.name}</p>
      </div>
    </Link>
  );
};

export default Card;
