# -------------------------------
# Stage 1: Build Frontend (React + Vite)
# -------------------------------
FROM node:18 AS frontend

WORKDIR /app

COPY package*.json vite.config.* ./
RUN npm install

COPY resources ./resources
COPY public ./public

RUN npm run build


# -------------------------------
# Stage 2: Backend (Laravel + PHP + Composer)
# -------------------------------
FROM php:8.2-fpm

# Install system dependencies & PHP extensions needed for Laravel + PhpSpreadsheet
RUN apt-get update && apt-get install -y \
    git curl unzip libzip-dev libonig-dev zip libpng-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy everything
COPY . .

# Copy frontend build
COPY --from=frontend /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Clear caches
RUN php artisan config:clear && \
    php artisan route:clear && \
    php artisan view:clear

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
