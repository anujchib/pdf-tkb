# Use Node.js 18 as the base image (matches your setup)
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists) to install dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install ImageMagick, libheif (for HEIC support), and Pandoc
RUN apt-get update && apt-get install -y imagemagick libheif-dev pandoc

# Copy ImageMagick policy file to allow HEIC and PDF conversions
#COPY imagemagick-policy.xml /etc/ImageMagick-6/policy.xml

# Create directories for uploads and converted files, set permissions
RUN mkdir -p /app/uploadFile /app/convertedFile && chmod -R 777 /app/uploadFile /app/convertedFile

# Copy the rest of the application code
COPY . .

# Expose port 8080 (as per your app's logs)
EXPOSE 8080

# Start the application
CMD ["npm", "start"]