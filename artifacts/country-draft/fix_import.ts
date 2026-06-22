import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');
content = content.replace(
  'import { Home, Globe as GlobeIcon, PartyPopper, ChevronDown, ChevronRight, X, MapPin, Trophy, ShieldAlert, ShieldPlus } from "lucide-react";',
  'import { Home, Globe as GlobeIcon, PartyPopper, ChevronDown, ChevronRight, X, MapPin, Trophy, ShieldAlert, ShieldPlus, ArrowDown } from "lucide-react";'
);

writeFileSync('src/pages/guess/GuessGame.tsx', content);
