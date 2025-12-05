# -------------------------------
# Stage 1: Build Frontend (React + Vite)
# -------------------------------
FROM node:18 AS frontend

WORKDIR /app

# Copy only frontend files first
COPY package*.json vite.config.* ./
RUN npm install

# Copy source files
COPY resources ./resources
COPY public ./public

# Build frontend
RUN npm run build

# -------------------------------
# Stage 2: Backend (Laravel + PHP + Composer + PostgreSQL)
# -------------------------------
FROM php:8.2-fpm

# Install system dependencies + PHP extensions
RUN apt-get update && apt-get install -y \
    git curl unzip libzip-dev libonig-dev zip \
    libpng-dev libjpeg-dev libfreetype6-dev libwebp-dev \
    libpq-dev \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy backend files
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY public ./public
COPY resources ./resources
COPY routes ./routes
COPY artisan composer.json composer.lock ./
COPY storage ./storage

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

# Expose port 9000 for PHP-FPM
EXPOSE 9000
CMD ["php-fpm"]
