# Use Node.js 18 as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Install build tools and dependencies (ImageMagick, Ghostscript, Pandoc)
RUN apt-get update && apt-get install -y \
    build-essential \
    imagemagick \
    libheif-dev \
    pandoc \
    ghostscript

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --production --verbose --network-timeout 100000 \
    && npm cache clean --force

# Copy ImageMagick policy file
COPY imagemagick-policy.xml /etc/ImageMagick-6/policy.xml

# Create directories and set permissions
RUN mkdir -p /app/uploadFile /app/convertedFile \
    && chmod -R 777 /app/uploadFile /app/convertedFile

# Copy the rest of the application code
COPY . .

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["npm", "start"]