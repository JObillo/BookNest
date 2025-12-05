# -------------------------------
# Stage 1: Build Frontend (React + Vite)
# -------------------------------
FROM node:18 AS frontend

WORKDIR /app

# Copy only frontend files
COPY package*.json vite.config.* ./
RUN npm install

COPY resources ./resources
COPY public ./public

# Build frontend
RUN npm run build

# -------------------------------
# Stage 2: Backend (Laravel + PHP)
# -------------------------------
FROM php:8.2-cli

# Install PHP extensions and system dependencies
RUN apt-get update && apt-get install -y \
    git curl unzip libzip-dev libonig-dev zip \
    libpng-dev libjpeg-dev libfreetype6-dev libwebp-dev \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install pdo pdo_mysql mbstring zip gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy backend + frontend build
COPY . .
COPY --from=frontend /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Clear Laravel caches
RUN php artisan config:clear && php artisan route:clear && php artisan view:clear

# Set permissions for storage and cache
RUN chown -R www-data:www-data storage bootstrap/cache

# Render requires listening on $PORT
ENV PORT=8080
EXPOSE 8080

# Run PHP built-in server on $PORT
CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]
