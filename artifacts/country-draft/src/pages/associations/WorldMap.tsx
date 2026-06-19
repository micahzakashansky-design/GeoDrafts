import React, { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { COUNTRIES, Country } from "@/data/countries";

// Pointing to the downloaded topojson file
const geoUrl = "/features.json";

interface WorldMapProps {
  interactive?: boolean;
  highlightedCountryIso?: string;
  onCountryClick?: (country: Country) => void;
  validIsos?: string[]; // If provided, only these countries are interactive/highlighted
}

export function WorldMap({
  interactive = false,
  highlightedCountryIso,
  onCountryClick,
  validIsos,
}: WorldMapProps) {
  // Map our countries by ISO for quick lookup
  const countryByIso = useMemo(() => {
    const map = new Map<string, Country>();
    COUNTRIES.forEach((c) => {
      if (c.isoNumeric && c.isoNumeric !== "000") {
        map.set(c.isoNumeric, c);
      }
    });
    return map;
  }, []);

  return (
    <div className="w-full h-full bg-secondary/20 rounded-xl overflow-hidden border border-border relative">
      <ComposableMap
        projectionConfig={{
          scale: 140,
        }}
        width={800}
        height={400}
      >
        <ZoomableGroup zoom={1} maxZoom={8}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoIso = geo.id;
                const isHighlighted = geoIso === highlightedCountryIso;
                const country = countryByIso.get(geoIso);
                
                // Determine if this country is part of the game pool
                const isValid = validIsos ? validIsos.includes(geoIso) : !!country;
                
                const isClickable = interactive && isValid;

                let fill = "#3f3f46"; // Default gray for non-playable areas
                if (isHighlighted) {
                  fill = "#f59e0b"; // amber-500
                } else if (isValid) {
                  fill = "#71717a"; // zinc-500 for playable countries
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#27272a" // zinc-800
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", transition: "all 250ms" },
                      hover: {
                        fill: isClickable ? "#f59e0b" : fill,
                        outline: "none",
                        cursor: isClickable ? "pointer" : "default",
                      },
                      pressed: {
                        fill: isClickable ? "#d97706" : fill,
                        outline: "none",
                      },
                    }}
                    onClick={() => {
                      if (isClickable && onCountryClick && country) {
                        onCountryClick(country);
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 p-1 rounded">
        Scroll to zoom, drag to pan
      </div>
    </div>
  );
}
