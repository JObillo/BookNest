# -------------------------------
# Stage 1: Build Frontend (React + Vite)
# -------------------------------
FROM node:18 AS frontend

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Build production assets
RUN npm run build

# -------------------------------
# Stage 2: Backend (Laravel + PHP + Composer)
# -------------------------------
FROM php:8.2-fpm

# Install system dependencies & PHP extensions needed for Laravel
RUN apt-get update && apt-get install -y \
    git curl unzip libonig-dev libzip-dev zip \
    && docker-php-ext-install pdo pdo_mysql mbstring zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy Laravel app
COPY . .

# Copy frontend build into Laravel public folder
COPY --from=frontend /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Clear caches
RUN php artisan config:clear && \
    php artisan route:clear && \
    php artisan view:clear

# Set permissions for storage and cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Expose port 9000 for PHP-FPM
EXPOSE 9000

CMD ["php-fpm"]
