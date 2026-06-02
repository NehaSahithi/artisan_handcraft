import React, { useState } from 'react';
import { IndiaMap } from '@vishalvoid/react-india-map';

export const STATE_MAPPING = {
  "IN-AP": "Andhra Pradesh",
  "IN-AR": "Arunachal Pradesh",
  "IN-AS": "Assam",
  "IN-BR": "Bihar",
  "IN-CT": "Chhattisgarh",
  "IN-GA": "Goa",
  "IN-GJ": "Gujarat",
  "IN-HR": "Haryana",
  "IN-HP": "Himachal Pradesh",
  "IN-JH": "Jharkhand",
  "IN-KA": "Karnataka",
  "IN-KL": "Kerala",
  "IN-MP": "Madhya Pradesh",
  "IN-MH": "Maharashtra",
  "IN-MN": "Manipur",
  "IN-ML": "Meghalaya",
  "IN-MZ": "Mizoram",
  "IN-NL": "Nagaland",
  "IN-OR": "Odisha",
  "IN-PB": "Punjab",
  "IN-RJ": "Rajasthan",
  "IN-SK": "Sikkim",
  "IN-TN": "Tamil Nadu",
  "IN-TG": "Telangana",
  "IN-TR": "Tripura",
  "IN-UP": "Uttar Pradesh",
  "IN-UT": "Uttarakhand",
  "IN-WB": "West Bengal",
  "IN-AN": "Andaman & Nicobar",
  "IN-CH": "Chandigarh",
  "IN-DN": "Dadra & Nagar Haveli and Daman & Diu",
  "IN-DD": "Dadra & Nagar Haveli and Daman & Diu",
  "IN-DL": "Delhi",
  "IN-JK": "Jammu & Kashmir",
  "IN-LA": "Ladakh",
  "IN-LD": "Lakshadweep",
  "IN-PY": "Puducherry"
};

export default function MapExplorer({ onStateSelect, activeState }) {
  const mapStyle = {
    backgroundColor: "transparent",
    hoverColor: "#e55b3c", // Primary brand terracotta orange
    stroke: "#a8a29e",     // Distinct stone outline for enhanced state boundaries
    strokeWidth: 1.5,
    tooltipConfig: {
      backgroundColor: "#1c1917", // dark charcoal
      textColor: "#ffffff"
    }
  };

  // Build state data dynamically to highlight the active state
  const stateData = Object.keys(STATE_MAPPING).map(id => ({
    id,
    customData: { name: STATE_MAPPING[id] },
    // If this state matches the active state, override its color to keep it highlighted
    ...(STATE_MAPPING[id] === activeState || (activeState && STATE_MAPPING[id].includes(activeState.split('/')[0])) 
        ? { color: '#e55b3c' } 
        : { color: '#e7e5e4' }) // default stone-200
  }));

  const handleStateClick = (id) => {
    const stateName = STATE_MAPPING[id];
    if (stateName && onStateSelect) {
      onStateSelect(stateName);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto aspect-square drop-shadow-xl transition-all duration-300">
      <IndiaMap 
        mapStyle={mapStyle} 
        stateData={stateData}
        onStateClick={handleStateClick}
      />
    </div>
  );
}
