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
import { useMemo } from "react";

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
  value?: string;
}

function RegionSelect({
  countryCode,
  priorityOptions = [],
  whitelist = [],
  blacklist = [],
  onChange = () => {},
  className,
  placeholder = "Region",
  value = "",
}: RegionSelectProps) {
  // Use useMemo to avoid recalculating on every render
  const regions = useMemo(() => {
    const country = countryRegionData.find(
      (country: CountryRegion) => country.countryShortCode === countryCode
    );

    if (country) {
      return filterRegions(country.regions, priorityOptions, whitelist, blacklist);
    }
    return [];
  }, [countryCode, priorityOptions, whitelist, blacklist]);

  return (
    <Select
      value={value}
      onValueChange={onChange}
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
