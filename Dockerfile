FROM node:20-alpine AS base

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

FROM base AS development
COPY . .
RUN yarn run db:generate
RUN yarn build
EXPOSE 3000
CMD ["yarn", "dev"]

FROM base AS production
COPY . .
RUN yarn run db:generate && \
    yarn build && \
    yarn install --production --frozen-lockfile && \
    yarn cache clean

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/src/index.js"]