import {
  LayoutGrid, Shirt, Footprints, ShoppingBag, Watch, Glasses, Gem, Sparkles, SprayCan, Baby,
  House, Sofa, CookingPot, Tv, Smartphone, Laptop, Apple, CupSoda, HeartPulse, Dumbbell, BookOpen,
  Gamepad2, Car, Wrench, PawPrint, Flower2, Scissors, Palette, Ellipsis, Truck, ShieldCheck,
  Headphones, Undo2, Award, Gift, BadgePercent, BadgeCheck, MapPin, Zap, Heart, Star, Backpack,
} from 'lucide-react';

/*
 * Les icônes que le vendeur choisit pour ses catégories et ses avantages.
 * Mêmes clés que ICONES_VITRINE côté API et que la liste du tableau de
 * bord : une clé inconnue retombe sur la grille.
 */
const ICONES = {
  tous: LayoutGrid, vetements: Shirt, tshirt: Shirt, chaussures: Footprints, sacs: ShoppingBag,
  accessoires: Backpack, montres: Watch, lunettes: Glasses, bijoux: Gem, beaute: Sparkles,
  parfums: SprayCan, enfants: Baby, maison: House, meubles: Sofa, cuisine: CookingPot,
  electronique: Tv, telephones: Smartphone, informatique: Laptop, alimentation: Apple,
  boissons: CupSoda, sante: HeartPulse, sport: Dumbbell, livres: BookOpen, jeux: Gamepad2,
  auto: Car, outils: Wrench, animaux: PawPrint, fleurs: Flower2, couture: Scissors, art: Palette,
  autres: Ellipsis, livraison: Truck, paiement: ShieldCheck, service: Headphones, retours: Undo2,
  qualite: Award, cadeau: Gift, promo: BadgePercent, garantie: BadgeCheck, local: MapPin,
  rapide: Zap, coeur: Heart, etoile: Star,
};

export default function IconeVitrine({ cle, size = 26, strokeWidth = 1.8, ...reste }) {
  const Icone = ICONES[cle] || LayoutGrid;
  return <Icone size={size} strokeWidth={strokeWidth} aria-hidden="true" {...reste} />;
}
