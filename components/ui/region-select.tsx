/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterRegions } from "@/lib/helpers";

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

interface RegionSelectProps {
  countryCode: string;
  priorityOptions?: string[];
  whitelist?: string[];
  blacklist?: string[];
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  defaultValue?: string;
}

function RegionSelect({
  countryCode,
  priorityOptions = [],
  whitelist = [],
  blacklist = [],
  onChange = () => {},
  className,
  placeholder = "Region",
  defaultValue,
}: RegionSelectProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [value, setValue] = useState<string>(defaultValue || "");

  useEffect(() => {
    const regions = countryRegionData.find(
      (country: CountryRegion) => country.countryShortCode === countryCode
    );

    if (regions) {
      setRegions(
        filterRegions(regions.regions, priorityOptions, whitelist, blacklist)
      );
    } else {
      setRegions([]);
    }
  }, [countryCode, priorityOptions, whitelist, blacklist]);

  // When defaultValue changes, update the internal value
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  // Reset value when country changes to avoid invalid region selection
  useEffect(() => {
    if (countryCode) {
      setValue(defaultValue || "");
    }
  }, [countryCode, defaultValue]);

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
        {regions.map(({ name, shortCode }) => (
          <SelectItem key={shortCode} value={shortCode}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default RegionSelect;
