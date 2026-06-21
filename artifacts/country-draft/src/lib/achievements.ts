import React from "react";
import { 
  Globe, Heart, Laptop, Shield, Swords, TrendingUp, Building, Star, Leaf, Mountain,
  Crown, Sun, Zap, Anchor, Briefcase, Stethoscope, BookOpen, Skull, Plane, Scale
} from "lucide-react";

export const RATINGS = [
  { id: "Global Hegemon", name: "Global Hegemon", color: "text-yellow-300", desc: "Absolute unipolar dominance." },
  { id: "Hyperpower", name: "Hyperpower", color: "text-yellow-400", desc: "An extraordinary superpower." },
  { id: "Superpower", name: "Superpower", color: "text-yellow-500", desc: "Unrivaled global influence and capabilities." },
  { id: "Great Power", name: "Great Power", color: "text-blue-300", desc: "Near-superpower influence." },
  { id: "Major Power", name: "Major Power", color: "text-blue-400", desc: "Significant influence on the world stage." },
  { id: "Middle Power", name: "Middle Power", color: "text-blue-500", desc: "Influential on a multi-regional scale." },
  { id: "Regional Power", name: "Regional Power", color: "text-green-400", desc: "Strong capabilities within its geographic sphere." },
  { id: "Emerging Power", name: "Emerging Power", color: "text-green-500", desc: "Rapidly growing influence." },
  { id: "Stable Nation", name: "Stable Nation", color: "text-teal-400", desc: "Solid, unshakeable foundations." },
  { id: "Developing Nation", name: "Developing Nation", color: "text-orange-400", desc: "Growing capabilities and emerging potential." },
  { id: "Transitional State", name: "Transitional State", color: "text-orange-500", desc: "In the midst of modernization." },
  { id: "Fragile State", name: "Fragile State", color: "text-red-400", desc: "Vulnerable to external/internal shocks." },
  { id: "Struggling State", name: "Struggling State", color: "text-red-500", desc: "Facing significant challenges and limitations." },
  { id: "Failed State", name: "Failed State", color: "text-rose-600", desc: "Severe systemic collapse." },
  { id: "Collapsed State", name: "Collapsed State", color: "text-zinc-500", desc: "Total breakdown of society." }
];

export const ARCHETYPES = [
  { id: "Cultural Hegemon", name: "Cultural Hegemon", color: "text-pink-400", desc: "Global exporter of art and ideas." },
  { id: "Industrial Juggernaut", name: "Industrial Juggernaut", color: "text-orange-500", desc: "The workshop of the world." },
  { id: "Fortress State", name: "Fortress State", color: "text-zinc-400", desc: "Impenetrable and isolated." },
  { id: "Cyberocracy", name: "Cyberocracy", color: "text-cyan-400", desc: "Ruled by algorithms and data." },
  { id: "Eco-Paradise", name: "Eco-Paradise", color: "text-emerald-400", desc: "In perfect harmony with nature." },
  { id: "Trade Empire", name: "Trade Empire", color: "text-amber-400", desc: "Master of global commerce." },
  { id: "Global Medic", name: "Global Medic", color: "text-rose-400", desc: "A sanctuary of healing and health." },
  { id: "Knowledge Hub", name: "Knowledge Hub", color: "text-indigo-400", desc: "The brightest minds in the world." },
  { id: "Resource Curse", name: "Resource Curse", color: "text-yellow-600", desc: "Wealthy land, impoverished people." },
  { id: "Spartan Society", name: "Spartan Society", color: "text-red-600", desc: "Strength above all else." },
  { id: "Military Superstate", name: "Military Superstate", color: "text-red-400", desc: "Unmatched hard power." },
  { id: "Techno-Utopia", name: "Techno-Utopia", color: "text-blue-400", desc: "A beacon of innovation." },
  { id: "Nordic Model", name: "Nordic Model", color: "text-green-400", desc: "World-leading quality of life." },
  { id: "Wealthy City-State", name: "Wealthy City-State", color: "text-yellow-400", desc: "Small but mighty." },
  { id: "Balanced Republic", name: "Balanced Republic", color: "text-primary", desc: "A well-rounded nation." }
];

export const BONUS_PATHS = [
  { id: "Trade Hub", name: "Trade Hub", color: "text-amber-500", desc: "A dense nexus of global exchange." },
  { id: "Nomadic Steppe", name: "Nomadic Steppe", color: "text-orange-300", desc: "Endless horizons, few inhabitants." },
  { id: "Service Economy", name: "Service Economy", color: "text-blue-300", desc: "Powered by minds, not mines." },
  { id: "Manufacturing Powerhouse", name: "Manufacturing Powerhouse", color: "text-zinc-400", desc: "A dense, productive workforce." },
  { id: "Tax Haven", name: "Tax Haven", color: "text-emerald-500", desc: "A tiny epicenter of global wealth." },
  { id: "Tourism Mecca", name: "Tourism Mecca", color: "text-pink-500", desc: "A beautiful paradise for visitors." },
  { id: "Strategic Chokepoint", name: "Strategic Chokepoint", color: "text-indigo-500", desc: "Controlling vital global arteries." },
  { id: "Wasteland Survival", name: "Wasteland Survival", color: "text-stone-500", desc: "Thriving against all natural odds." },
  { id: "Frozen Fortress", name: "Frozen Fortress", color: "text-cyan-200", desc: "Protected by ice and isolation." },
  { id: "Agrarian Giant", name: "Agrarian Giant", color: "text-lime-500", desc: "Feeding the world from vast plains." },
  { id: "Agricultural society", name: "Agricultural society", color: "text-yellow-500", desc: "Vast lands with sparse population." },
  { id: "Resource Extraction", name: "Resource Extraction", color: "text-yellow-500", desc: "Massive nation built for resource extraction." },
  { id: "Tech Megacity", name: "Tech Megacity", color: "text-yellow-500", desc: "Dense population in a compact area." }
];

export function getAchievementIcon(name: string, className: string = "w-5 h-5") {
  switch (name) {
    // Ratings
    case "Global Hegemon": return React.createElement(Crown, { className: `${className} text-yellow-300` });
    case "Hyperpower": return React.createElement(Star, { className: `${className} text-yellow-400 fill-yellow-400` });
    case "Superpower": return React.createElement(Star, { className: `${className} text-yellow-500 fill-yellow-500` });
    case "Great Power": return React.createElement(Globe, { className: `${className} text-blue-300` });
    case "Major Power": return React.createElement(Globe, { className: `${className} text-blue-400` });
    case "Middle Power": return React.createElement(Globe, { className: `${className} text-blue-500` });
    case "Regional Power": return React.createElement(Shield, { className: `${className} text-green-400` });
    case "Emerging Power": return React.createElement(TrendingUp, { className: `${className} text-green-500` });
    case "Stable Nation": return React.createElement(Building, { className: `${className} text-teal-400` });
    case "Developing Nation": return React.createElement(TrendingUp, { className: `${className} text-orange-400` });
    case "Transitional State": return React.createElement(TrendingUp, { className: `${className} text-orange-500` });
    case "Fragile State": return React.createElement(Building, { className: `${className} text-red-400` });
    case "Struggling State": return React.createElement(Building, { className: `${className} text-red-500` });
    case "Failed State": return React.createElement(Skull, { className: `${className} text-rose-600` });
    case "Collapsed State": return React.createElement(Skull, { className: `${className} text-zinc-500` });

    // Archetypes
    case "Cultural Hegemon": return React.createElement(Heart, { className: `${className} text-pink-400` });
    case "Industrial Juggernaut": return React.createElement(Building, { className: `${className} text-orange-500` });
    case "Fortress State": return React.createElement(Shield, { className: `${className} text-zinc-400` });
    case "Cyberocracy": return React.createElement(Laptop, { className: `${className} text-cyan-400` });
    case "Eco-Paradise": return React.createElement(Leaf, { className: `${className} text-emerald-400` });
    case "Trade Empire": return React.createElement(Briefcase, { className: `${className} text-amber-400` });
    case "Global Medic": return React.createElement(Stethoscope, { className: `${className} text-rose-400` });
    case "Knowledge Hub": return React.createElement(BookOpen, { className: `${className} text-indigo-400` });
    case "Resource Curse": return React.createElement(Mountain, { className: `${className} text-yellow-600` });
    case "Spartan Society": return React.createElement(Swords, { className: `${className} text-red-600` });
    case "Military Superstate": return React.createElement(Swords, { className: `${className} text-red-400` });
    case "Techno-Utopia": return React.createElement(Laptop, { className: `${className} text-blue-400` });
    case "Nordic Model": return React.createElement(Heart, { className: `${className} text-green-400` });
    case "Wealthy City-State": return React.createElement(Building, { className: `${className} text-yellow-400` });
    case "Balanced Republic": return React.createElement(Scale, { className: `${className} text-primary` });

    // Bonus Paths
    case "Trade Hub": return React.createElement(Anchor, { className: `${className} text-amber-500` });
    case "Nomadic Steppe": return React.createElement(Sun, { className: `${className} text-orange-300` });
    case "Service Economy": return React.createElement(Briefcase, { className: `${className} text-blue-300` });
    case "Manufacturing Powerhouse": return React.createElement(Building, { className: `${className} text-zinc-400` });
    case "Tax Haven": return React.createElement(Briefcase, { className: `${className} text-emerald-500` });
    case "Tourism Mecca": return React.createElement(Plane, { className: `${className} text-pink-500` });
    case "Strategic Chokepoint": return React.createElement(Anchor, { className: `${className} text-indigo-500` });
    case "Wasteland Survival": return React.createElement(Skull, { className: `${className} text-stone-500` });
    case "Frozen Fortress": return React.createElement(Shield, { className: `${className} text-cyan-200` });
    case "Agrarian Giant": return React.createElement(Leaf, { className: `${className} text-lime-500` });
    case "Agricultural society": return React.createElement(Leaf, { className: `${className} text-yellow-500` });
    case "Resource Extraction": return React.createElement(Mountain, { className: `${className} text-yellow-500` });
    case "Tech Megacity": return React.createElement(Laptop, { className: `${className} text-yellow-500` });
    
    default: return React.createElement(Star, { className });
  }
}
