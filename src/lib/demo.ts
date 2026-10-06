import type { AnalyzeRequest, Listing } from "./listing";

type DemoItem = Omit<Listing, "title" | "description"> & {
  variants: { title: string; description: string }[];
};

const DEMO_ITEMS: DemoItem[] = [
  {
    categoryId: "meubles",
    condition: "bon",
    brand: "IKEA",
    price: {
      suggested: 120,
      min: 90,
      max: 150,
      justification:
        "Neuve, la Markus se vend environ 299 $ chez IKEA. Usagée en bon état, elle part généralement entre 90 $ et 150 $ sur Marketplace dans le Grand Montréal; un prix de 120 $ laisse une petite marge de négociation.",
    },
    confidence: "moyenne",
    warnings: [
      "Vérifie l'usure du tissu des appuie-bras : elle n'est pas visible sur la photo.",
    ],
    variants: [
      {
        title: "Chaise de bureau ergonomique IKEA Markus – noire",
        description:
          "Chaise de bureau IKEA Markus en bon état, utilisée en télétravail.\n\n• Dossier haut en filet respirant avec appui-tête intégré\n• Hauteur et inclinaison ajustables, roulettes en bon état\n• Revêtement noir sans déchirure\n• Quelques marques d'usure normales sur les appuie-bras\n\nIdéale pour un bureau à la maison. Ramassage sur place, je peux aider à la mettre dans l'auto.",
      },
      {
        title: "IKEA Markus – chaise de bureau confortable, bon état",
        description:
          "Je vends ma chaise IKEA Markus, très confortable pour les longues journées devant l'ordi.\n\nDossier en filet, appui-tête, mécanisme d'inclinaison avec blocage et hauteur ajustable. Tout fonctionne parfaitement. Légère usure sur les appuie-bras, rien de majeur.\n\nPremier arrivé, premier servi. Paiement comptant ou virement Interac.",
      },
    ],
  },
  {
    categoryId: "velos",
    condition: "bon",
    brand: "Trek",
    price: {
      suggested: 450,
      min: 375,
      max: 525,
      justification:
        "Un Trek Marlin 5 récent se vend environ 900 $ neuf. Les modèles de 3-4 ans en bon état s'affichent de 375 $ à 525 $ au Québec; le prix monte au printemps et baisse à l'automne.",
    },
    confidence: "moyenne",
    warnings: [
      "L'année exacte et la grandeur du cadre ne sont pas lisibles : vérifie l'autocollant sous le cadre.",
    ],
    variants: [
      {
        title: "Vélo de montagne Trek Marlin 5 – cadre M, 29 po",
        description:
          "Vélo de montagne Trek Marlin 5 en bon état, entretenu régulièrement.\n\n• Roues de 29 po, cadre en aluminium (grandeur M)\n• Fourche à suspension avant\n• Freins à disque, transmission qui passe bien les vitesses\n• Pneus avec encore beaucoup d'usure devant eux\n\nQuelques égratignures cosmétiques sur le cadre. Parfait pour les sentiers ou la ville. Essai possible sur place.",
      },
      {
        title: "Trek Marlin 5 29 po – prêt pour la saison",
        description:
          "Bon vélo de montagne Trek Marlin 5, roues 29 po, cadre M en aluminium.\n\nSuspension avant, freins à disque, vitesses ajustées récemment. Petites marques d'usage, mais mécaniquement impeccable.\n\nÀ venir chercher, essai bienvenu. Pas d'échange, merci.",
      },
    ],
  },
  {
    categoryId: "jeux-video",
    condition: "comme-neuf",
    brand: "Nintendo",
    price: {
      suggested: 280,
      min: 250,
      max: 320,
      justification:
        "La Switch OLED se vend 449 $ neuve au Canada. Comme neuve avec la boîte et les accessoires, elle se revend habituellement entre 250 $ et 320 $ sur Marketplace.",
    },
    confidence: "elevee",
    warnings: ["Confirme si la boîte d'origine et le chargeur sont inclus."],
    variants: [
      {
        title: "Nintendo Switch OLED blanche – comme neuve",
        description:
          "Console Nintendo Switch modèle OLED, couleur blanche, comme neuve.\n\n• Écran OLED 7 po sans égratignure (protecteur installé depuis le jour 1)\n• Joy-Con blancs fonctionnels, aucun « drift »\n• Station d'accueil, chargeur et câble HDMI inclus\n\nPeu utilisée, toujours rangée dans un étui. Réinitialisée et prête à être configurée.",
      },
      {
        title: "Switch OLED blanche + accessoires – état impeccable",
        description:
          "Je vends ma Nintendo Switch OLED, à peine utilisée.\n\nÉcran parfait avec protecteur, Joy-Con sans défaut, dock et câbles d'origine. Console réinitialisée.\n\nRencontre dans un endroit public possible. Paiement comptant ou Interac.",
      },
    ],
  },
  {
    categoryId: "electromenagers",
    condition: "bon",
    brand: "KitchenAid",
    price: {
      suggested: 220,
      min: 180,
      max: 260,
      justification:
        "Un batteur sur socle KitchenAid Artisan 5 pintes coûte environ 550 $ neuf. Usagé en bon état avec ses accessoires, il se vend généralement entre 180 $ et 260 $.",
    },
    confidence: "moyenne",
    warnings: [
      "Indique quels accessoires sont inclus (fouet, crochet pétrisseur, batteur plat).",
    ],
    variants: [
      {
        title: "Batteur sur socle KitchenAid Artisan 5 pintes – argent",
        description:
          "Batteur sur socle KitchenAid Artisan, bol en inox de 5 pintes, couleur argent.\n\n• Moteur puissant, 10 vitesses, fonctionne parfaitement\n• Inclus : bol, batteur plat, fouet et crochet pétrisseur\n• Quelques marques d'usage sur la base\n\nParfait pour la pâtisserie et le pain maison. Ramassage seulement.",
      },
      {
        title: "KitchenAid Artisan argent – batteur sur socle avec accessoires",
        description:
          "Mon fidèle KitchenAid Artisan cherche une nouvelle cuisine!\n\nBol inox 5 pintes, 10 vitesses, livré avec le fouet, le crochet pétrisseur et le batteur plat. Fonctionne comme au premier jour, légère usure cosmétique.\n\nÀ venir chercher. Prix ferme si ramassé cette semaine.",
      },
    ],
  },
];

function hash(text: string): number {
  let h = 0;
  const step = Math.max(1, Math.floor(text.length / 512));
  for (let i = 0; i < text.length; i += step) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Sans clé OpenAI, on ne peut pas « voir » la photo : on choisit un exemple
 * réaliste de façon déterministe à partir de l'image, pour que la même photo
 * donne toujours la même annonce.
 */
export function demoListing(req: AnalyzeRequest): Listing {
  const item = DEMO_ITEMS[hash(req.images[0] ?? "") % DEMO_ITEMS.length];

  let variantIndex = 0;
  if (req.previous) {
    const current = item.variants.findIndex(
      (v) => v.title === req.previous!.title,
    );
    variantIndex = (Math.max(current, 0) + 1) % item.variants.length;
  }
  const variant = item.variants[variantIndex];

  const instruction = req.instruction?.toLowerCase() ?? "";
  const price = { ...item.price };
  if (/bas|baiss|moins cher|vite/.test(instruction)) {
    price.suggested = price.min;
    price.justification +=
      " Prix ajusté vers le bas de la fourchette pour une vente rapide.";
  } else if (/haut|mont|plus cher/.test(instruction)) {
    price.suggested = price.max;
    price.justification +=
      " Prix ajusté vers le haut de la fourchette; prévois plus de temps avant de vendre.";
  }

  let description = variant.description;
  if (/court|bref|concis/.test(instruction)) {
    description = description.split("\n\n").slice(0, 2).join("\n\n");
  }
  if (req.notes?.trim()) {
    description += `\n\n${req.notes.trim()}`;
  }

  return {
    title: variant.title,
    description,
    categoryId: item.categoryId,
    condition: item.condition,
    brand: item.brand,
    price,
    confidence: item.confidence,
    warnings: [
      "Mode démo : l'annonce est un exemple et ne correspond pas forcément à ta photo. Ajoute une clé OpenAI pour l'analyse réelle.",
      ...item.warnings,
    ],
  };
}
