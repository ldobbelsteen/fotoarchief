FROM node:lts AS base
WORKDIR /app

FROM base AS build
COPY package*.json ./
RUN npm ci
COPY prisma prisma
RUN npm run prisma:generate
COPY . .
RUN npm run build

FROM base
ENV NODE_ENV production
RUN npm install -g prisma
COPY prisma ./prisma
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
CMD ["bash", "-c", "prisma migrate deploy && node server.js"]
