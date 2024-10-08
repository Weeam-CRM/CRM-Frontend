import React, { useRef } from "react";
import { InputGroup, Input, InputLeftElement } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

const CustomSearchInput = ({
  allData,
  setSearchbox,
  fetchSearch,
  isPaginated = false,
  setDisplaySearchData,
  searchbox,
  dataColumn,
  onSearch,
}) => {
  const handleInputChange = (e) => {
    if (!isPaginated) {
      const searchTerm = e.target.value;

      const results = allData.filter((item) => {
        // Check if any of the specified columns contains the search term
        return dataColumn.some((column) => {
          const columnValue = item[column.accessor];

          return columnValue && typeof columnValue === "string"
            ? columnValue.toLowerCase().includes(searchTerm)
            : typeof columnValue === "number" &&
                columnValue.toString().includes(searchTerm);
        });
      });

      setSearchbox(searchTerm ? searchTerm : "");
      setDisplaySearchData(e.target.value === "" ? false : true);
      onSearch(results);
    }
  };

  const handleKeyUp = async (e) => {
    if (e.key === "Enter") {
      fetchSearch();
    }
  };

  const justARef = useRef();

  const extraProps = {}; 

  if(!isPaginated) {
    extraProps.value = searchbox; 
  }


  return (
    <InputGroup
      width={{ sm: "100%", md: "30%" }}
      mx={{ sm: 0, md: 3 }}
      my={{ sm: "8px", md: "0" }}
    >
      <InputLeftElement
        size="sm"
        top="-3px"
        pointerEvents="none"
        zIndex="0"
        children={<SearchIcon color="gray.300" borderRadius="16px" />}
      />
      <Input
        type="text"
        size="sm"
        fontSize="sm"
        {...extraProps}
        onChange={handleInputChange}
        fontWeight="500"
        ref={isPaginated ? searchbox : justARef}
        onKeyUp={handleKeyUp}
        placeholder="Search..."
        borderRadius="16px"
      />
    </InputGroup>
  );
};

export default CustomSearchInput;