FROM node:18-alpine
RUN apk add --no-cache openssl openssl-dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
RUN mkdir -p /uploads /app/data
EXPOSE 4000
ENV NODE_ENV=production
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
