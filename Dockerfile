FROM node:20

WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install fresh dependencies INSIDE the container
RUN npm install --production

# Then copy your source code
COPY . .

EXPOSE 3000
CMD ["npm", "start"]