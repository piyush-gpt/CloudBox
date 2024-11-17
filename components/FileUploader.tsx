"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "./Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/actions/files.actions";
import { usePathname } from "next/navigation";

interface props {
  accountId: string;
  ownerId:string;
  className?: string;
}

const FileUploader = ({  accountId, className , ownerId}: props) => {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const path = usePathname();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    const uploadPromises = acceptedFiles.map(async (file) => {
      if (file.size > MAX_FILE_SIZE) {
        setFiles((prev) => prev.filter((f) => f.name !== file.name));
        return toast({
          description: (
            <p className="body-2 text-white">
              <span className="font-semibold">{file.name}</span> is too large.
              Max file size in 50MB
            </p>
          ),
          className: "error-toast",
        });
      }
      return uploadFile({ file,  accountId, ownerId, path }).then(
        (uploadedFile) => {
          if (uploadedFile) {
            setFiles((prev) => prev.filter((f) => f.name !== file.name));
          }
        }
      ).catch((e)=>{
        setFiles((prev) => prev.filter((f) => f.name !== file.name));
      })
    });

    await Promise.all(uploadPromises);
  }, [accountId,path]);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  function handleRemoveFile(
    e: React.MouseEvent<HTMLImageElement>,
    fileName: string
  ) {
    e.stopPropagation();
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  }

  return (
    <div {...getRootProps()} className=" cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn("uploader-button", className)}>
        <Image
          src="assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}
        />{" "}
        <p>Upload</p>
      </Button>
      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading</h4>

          {files.map((file, idx) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li key={`${file.name}-${idx}`} className="uploader-preview-item">
                <div className="flex items-center gap-3 ">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />

                  <div className="preview-item-name">
                    {file.name}
                    <Image
                      src="/assets/icons/file-loader.gif"
                      width={80}
                      height={26}
                      alt="Loader"
                    />
                  </div>
                </div>

                <Image
                  src="/assets/icons/remove.svg"
                  width={24}
                  height={24}
                  alt="Remove"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
