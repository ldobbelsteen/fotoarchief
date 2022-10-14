# Fotoarchief

Het fotoarchief is een applicatie om foto's in albums te uploaden en te delen met leden.

# Installatie

De applicatie is gebaseerd op Next.js, dus je hebt alleen Node nodig. Je installeert alle benodigde dependencies met:

```
npm install
```

Vervolgens genereer je een database met de volgende commands:

```
npm run prisma:generate
npm run prisma:migrate
```

# Draaien

- `npm run dev` (voor lokale development)

- `npm run build` (om een productie build te maken)

- `npm run start` (om je productie build te draaien)

# Docker

Er is een Dockerfile aanwezig waar je een image mee kan bouwen. Voorgebouwde images zijn te vinden in de GitHub Packages van deze repository. Een voorbeeld van hoe je de image gebruikt:

```
docker run \
    --detach \
    --restart always \
    --publish 3000:3000 \
    --volume /storage/path:/app/data \
    ghcr.io/ldobbelsteen/fotoarchief
```
