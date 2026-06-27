FROM docker.iranserver.com/library/node:24-alpine
WORKDIR /app

# Copy package files and install all dependencies
COPY package.json ./
RUN npm install --verbose

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
