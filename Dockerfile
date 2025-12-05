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
# Stage 2: Backend (Laravel + PHP)
# -------------------------------
FROM php:8.2-fpm

# Install dependencies + GD full support
RUN apt-get update && apt-get install -y \
    git curl unzip libzip-dev libonig-dev zip \
    libpng-dev libjpeg-dev libfreetype6-dev libwebp-dev \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install pdo pdo_mysql mbstring zip gd

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

# Copy Vite build
COPY --from=frontend /app/public/build ./public/build

# Install backend deps
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Clear caches
RUN php artisan config:clear && \
    php artisan route:clear && \
    php artisan view:clear

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
