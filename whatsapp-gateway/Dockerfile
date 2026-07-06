FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

COPY --chown=pptruser:pptruser package*.json ./
RUN npm ci

COPY --chown=pptruser:pptruser . .

USER pptruser

EXPOSE 3001

CMD ["npm", "start"]
