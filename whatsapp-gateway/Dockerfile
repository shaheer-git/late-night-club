FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Ensure the non-root user (pptruser) can write to the directory
# This is required for RemoteAuth to create the zip file
RUN chown -R pptruser:pptruser /app

USER pptruser

EXPOSE 3001

CMD ["npm", "start"]
