"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { useDebounce } from 'use-debounce';
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { apiConnector } from "@/utils/apiconnector";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const path=usePathname();
  const router=useRouter();
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    const fetchFiles = async () => {
      if(debouncedQuery.length===0){
        setOpen(false);
        setResults([]);
        return router.push(path.replace(searchParams.toString(),""));
      }
      const response = await apiConnector("POST", "/api/getFiles", {
        searchText: debouncedQuery,
      });
      let files;
      if (response.status === 200) {
        files = response.data.files;
        setResults(files);
        setOpen(true);
      }
    };
    fetchFiles();
  }, [debouncedQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    } else {
      setQuery(searchQuery);
    }
  }, [searchQuery]);


  const handleClickItem=(file:any)=>{
    setOpen(false);
    setResults([]);
    router.push(`/${(file.type==="video" || file.type=== "audio")? "media" : file.type + 's'}?query=${query}`)


  }
  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="search"
          width={24}
          height={24}
        />
        <Input
          value={query}
          placeholder="Search...."
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
        />

        {open && (
          <ul className="search-result">
            {results.length > 0 ? (
              results.map((file) => (
                <li
                  key={file._id}
                  className="flex items-center justify-between"
                  onClick={()=> handleClickItem(file)}
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">{`${file.name}${'.'}${file.extension}`}</p>
                  </div>
                  <FormattedDateTime date={file._id} className="caption line-clamp-1 text-light-200"/>
                </li>
              ))
            ) : (
              <p className=" empty-result">No files</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
