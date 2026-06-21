import React from "react";
import { Globe, Heart, Laptop, Shield, Swords, TrendingUp, Building, Star, Leaf, Mountain } from "lucide-react";

export const RATINGS = [
  { id: "Superpower", name: "Superpower", color: "text-yellow-400", desc: "Unrivaled global influence and capabilities." },
  { id: "Major Power", name: "Major Power", color: "text-blue-400", desc: "Significant influence on the world stage." },
  { id: "Regional Power", name: "Regional Power", color: "text-green-400", desc: "Strong capabilities within its geographic sphere." },
  { id: "Developing Nation", name: "Developing Nation", color: "text-orange-400", desc: "Growing capabilities and emerging potential." },
  { id: "Struggling State", name: "Struggling State", color: "text-red-400", desc: "Facing significant challenges and limitations." }
];

export const ARCHETYPES = [
  { id: "Military Superstate", name: "Military Superstate", color: "text-red-400", desc: "Unmatched hard power." },
  { id: "Techno-Utopia", name: "Techno-Utopia", color: "text-blue-400", desc: "A beacon of innovation." },
  { id: "Nordic Model", name: "Nordic Model", color: "text-green-400", desc: "World-leading quality of life." },
  { id: "Wealthy City-State", name: "Wealthy City-State", color: "text-yellow-400", desc: "Small but mighty." },
  { id: "Balanced Republic", name: "Balanced Republic", color: "text-primary", desc: "A well-rounded nation." }
];

export const BONUS_PATHS = [
  { id: "Agricultural society", name: "Agricultural society", color: "text-yellow-500", desc: "Vast lands with sparse population." },
  { id: "Resource Extraction", name: "Resource Extraction", color: "text-yellow-500", desc: "Massive nation built for resource extraction." },
  { id: "Tech Megacity", name: "Tech Megacity", color: "text-yellow-500", desc: "Dense population in a compact area." }
];

export function getAchievementIcon(name: string, className: string = "w-5 h-5") {
  switch (name) {
    case "Superpower": return React.createElement(Star, { className: `${className} text-yellow-400 fill-yellow-400` });
    case "Major Power": return React.createElement(Globe, { className: `${className} text-blue-400` });
    case "Regional Power": return React.createElement(Shield, { className: `${className} text-green-400` });
    case "Developing Nation": return React.createElement(TrendingUp, { className: `${className} text-orange-400` });
    case "Struggling State": return React.createElement(Building, { className: `${className} text-red-400` });
    case "Military Superstate": return React.createElement(Swords, { className: `${className} text-red-400` });
    case "Techno-Utopia": return React.createElement(Laptop, { className: `${className} text-blue-400` });
    case "Nordic Model": return React.createElement(Heart, { className: `${className} text-green-400` });
    case "Wealthy City-State": return React.createElement(Building, { className: `${className} text-yellow-400` });
    case "Balanced Republic": return React.createElement(Globe, { className: `${className} text-primary` });
    case "Agricultural society": return React.createElement(Leaf, { className: `${className} text-yellow-500` });
    case "Resource Extraction": return React.createElement(Mountain, { className: `${className} text-yellow-500` });
    case "Tech Megacity": return React.createElement(Building, { className: `${className} text-yellow-500` });
    default: return React.createElement(Star, { className });
  }
}
