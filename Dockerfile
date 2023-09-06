FROM node:18.16.1 as base

WORKDIR /app

# ---------- Builder ----------
# Creates:
# - node_modules: production dependencies (no dev dependencies)
FROM base AS builder

COPY package*.json ./
COPY yarn.lock ./
COPY ./prisma ./prisma

RUN yarn install --ignore-engines --only=production

COPY ./ ./

RUN yarn build

# ---------- Release ----------
FROM base AS release

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

USER node

ENV NODE_ENV production
ENV NODE_PATH ./build

EXPOSE 3000

CMD ["/bin/bash", "-c", "./scripts/start.sh"]
