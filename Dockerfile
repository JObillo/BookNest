# Stage 1 - Build Frontend (Vite)
FROM node:18 AS frontend
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files and build frontend
COPY . .
RUN npm run build

# Stage 2 - Backend (Laravel + PHP + Composer)
FROM php:8.2-fpm
WORKDIR /var/www

# Install system dependencies for PHP
RUN apt-get update && apt-get install -y \
    git curl unzip libpq-dev libonig-dev libzip-dev zip \
    && docker-php-ext-install pdo pdo_mysql mbstring zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy Laravel app files
COPY . .

# Copy built frontend assets
COPY --from=frontend /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Clear Laravel caches
RUN php artisan config:clear \
 && php artisan route:clear \
 && php artisan view:clear

# Expose port 9000 and start PHP-FPM
EXPOSE 9000
CMD ["php-fpm"]
