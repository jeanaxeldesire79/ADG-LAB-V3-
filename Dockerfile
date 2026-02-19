# Use Node.js LTS base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy app source
COPY . .

# Expose app port and start it
EXPOSE 3000
CMD ["npm", "start"]
