/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterCountries } from "@/lib/helpers";
//@ts-ignore
import countryRegionData from "country-region-data/dist/data-umd";
import { useEffect, useState } from "react";

export interface Region {
  name: string;
  shortCode: string;
}

export interface CountryRegion {
  countryName: string;
  countryShortCode: string;
  regions: Region[];
}

interface CountrySelectProps {
  priorityOptions?: string[];
  whitelist?: string[];
  blacklist?: string[];
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  defaultValue?: string;
}

function CountrySelect({
  priorityOptions = [],
  whitelist = [],
  blacklist = [],
  onChange = () => {},
  className,
  placeholder = "Country",
  defaultValue,
}: CountrySelectProps) {
  const [countries, setCountries] = useState<CountryRegion[]>([]);
  const [value, setValue] = useState<string>(defaultValue || "");

  useEffect(() => {
    setCountries(
      filterCountries(countryRegionData, priorityOptions, whitelist, blacklist)
    );
  }, [priorityOptions, whitelist, blacklist]);

  // When defaultValue changes, update the internal value
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  return (
    <Select
      value={value}
      onValueChange={(selectedValue: string) => {
        setValue(selectedValue);
        onChange(selectedValue);
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {countries.map(({ countryName, countryShortCode }) => (
          <SelectItem key={countryShortCode} value={countryShortCode}>
            {countryName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CountrySelect;
