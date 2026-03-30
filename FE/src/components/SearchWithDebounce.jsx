import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Search, Loader2, X } from "lucide-react"; 
import { useDebounce } from 'use-debounce'; 
import axiosClient from '@/api/axiosClient';

const SearchWithSpinner = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  
  
  const [isLoading, setIsLoading] = useState(false); 

  const [debouncedTerm] = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchApi = async () => {
      if (!debouncedTerm) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        console.log("Calling API...");
        // delay 1.5 giây 
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        const res = await axiosClient.get(`/products?search=${debouncedTerm}`);
        setResults(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApi();
  }, [debouncedTerm]);

  const handleClear = () => {
    setSearchTerm("");
    setResults([]);
  };

  return (
    <div className="w-full max-w-md relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        <Input
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10" 
        />

        
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : searchTerm ? (
            <button onClick={handleClear}>
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-2">
      </div>
    </div>
  );
};

export default SearchWithSpinner;