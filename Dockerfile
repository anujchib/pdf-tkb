FROM node:23-slim

# Install dependencies and configure in a single layer to reduce image size
RUN apt-get update && apt-get install -y --no-install-recommends \
    pandoc \
    imagemagick \
    ghostscript \
    && sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml \
    # Create a symlink for magick if it doesn't exist
    && (which magick || ln -s /usr/bin/convert /usr/local/bin/magick) \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user to enhance security
RUN groupadd -r appuser && useradd -r -g appuser -m appuser

# Create app directory and set permissions
WORKDIR /app

# Copy package files and install dependencies
COPY --chown=appuser:appuser package*.json ./
RUN npm install --production && npm cache clean --force

# Create required directories and set permissions
RUN mkdir -p convertedFile uploadFile \
    && chown -R appuser:appuser /app

# Copy the application code (after installing dependencies to leverage caching)
COPY --chown=appuser:appuser . .

# Add healthcheck to verify the service is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => res.statusCode === 200 ? process.exit(0) : process.exit(1))" || exit 1

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["npm", "start"]