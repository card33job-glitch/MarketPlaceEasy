# MarketPlaceEasy

Prends un objet en photo, et l'IA fait toute la job pour créer ton annonce Facebook Marketplace :

- **titre et description** rédigés à partir des photos (marque, état, caractéristiques visibles);
- **catégorie Marketplace** la plus appropriée (liste réelle des catégories Facebook);
- **prix estimé** en dollars canadiens, avec une fourchette et une courte justification;
- **écran d'aperçu** : « Oui, je la veux comme ça », modifier les champs ou régénérer une autre version;
- après confirmation : **copier chaque champ en un clic** et ouvrir la page de création d'annonce Facebook;
- **historique local** des annonces confirmées (dans le navigateur, sans compte ni base de données).

Facebook n'offre pas d'API publique pour publier sur Marketplace : la publication finale se fait en collant les champs dans le formulaire Facebook.

## Installation sur Mac

Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent (`node -v` pour vérifier). Avec Homebrew : `brew install node`.

```bash
# 1. Cloner le projet dans ton dossier
mkdir -p ~/Steve
cd ~/Steve
git clone <url-du-dépôt> marketPlaceEasy
cd marketPlaceEasy

# 2. Installer les dépendances
npm install

# 3. Configurer la clé OpenAI (facultatif, voir plus bas)
cp .env.example .env.local
open -e .env.local   # colle ta clé après OPENAI_API_KEY=

# 4. Lancer le serveur de développement
npm run dev
```

Ouvre ensuite [http://localhost:3000](http://localhost:3000) dans ton navigateur.

### Clé OpenAI et mode démo

- Avec `OPENAI_API_KEY` dans `.env.local`, les photos sont analysées par un modèle vision OpenAI (`gpt-4o` par défaut, modifiable avec `OPENAI_MODEL`). Crée une clé sur [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
- **Sans clé**, l'app fonctionne en **mode démo** : elle génère une annonce d'exemple réaliste (chaise de bureau, vélo, console, batteur) qui ne correspond pas à ta photo, pour tester le parcours complet. Un badge « Mode démo » l'indique.
- Redémarre `npm run dev` après avoir modifié `.env.local`.

### Tester depuis ton téléphone

Pour prendre la photo directement avec ton cellulaire, sur le même réseau Wi-Fi que le Mac :

```bash
npm run dev -- -H 0.0.0.0
```

Puis ouvre `http://<IP-du-Mac>:3000` sur le téléphone (l'IP se trouve dans Réglages Système → Wi-Fi → Détails, ou avec `ipconfig getifaddr en0`).

## Scripts

| Commande        | Rôle                                   |
| --------------- | -------------------------------------- |
| `npm run dev`   | Serveur de développement               |
| `npm run build` | Build de production                    |
| `npm start`     | Lance le build de production           |
| `npm run lint`  | Vérification ESLint                    |

## Limites à connaître

- **Prix** : l'estimation vient des connaissances générales du modèle, pas d'une recherche en direct des annonces Marketplace. Elle donne un bon ordre de grandeur, mais vérifie quelques annonces semblables dans ta région avant de publier, surtout pour les objets rares, de collection ou très récents.
- **Identification** : le modèle exact, l'année ou les défauts cachés ne sont pas toujours visibles sur une photo. Les points à vérifier sont listés dans l'aperçu, et tu peux ajouter des précisions avant l'analyse.
- **Historique** : stocké dans le `localStorage` du navigateur. Il n'est pas synchronisé entre appareils et disparaît si tu vides les données du site. Seules des miniatures des photos sont gardées.
- **Photos HEIC** (iPhone) : Safari les convertit automatiquement; certains navigateurs de bureau ne peuvent pas les lire. Exporte-les en JPEG au besoin.

## Structure

```
src/
  app/
    page.tsx              Parcours : photos → analyse → aperçu → confirmation
    historique/page.tsx   Annonces confirmées
    api/analyze/route.ts  Analyse des photos (OpenAI ou mode démo)
  components/             Écrans et composants (shadcn/ui dans components/ui)
  lib/
    marketplace.ts        Catégories et états Facebook Marketplace, format CAD
    ai.ts                 Appel au modèle vision OpenAI (sortie JSON structurée)
    demo.ts               Annonces d'exemple du mode démo
    history.ts            Historique local (localStorage)
```

Stack : Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
