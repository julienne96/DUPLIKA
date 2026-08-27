# =========================================================
# 1. APPLICATION PHP + COMPOSER
# =========================================================
FROM php:8.3-cli AS app-build

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libicu-dev \
    libpng-dev \
    && docker-php-ext-install \
        pdo_mysql \
        bcmath \
        intl \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist


# =========================================================
# 2. BUILD VITE
# =========================================================
FROM node:22-alpine AS vite-build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# IMPORTANT :
# Filament theme.css est nécessaire au build Tailwind/Vite
COPY --from=app-build \
    /var/www/html/vendor \
    /app/vendor

RUN npm run build

# Vérification obligatoire
RUN test -f /app/public/build/manifest.json


# =========================================================
# 3. IMAGE FINALE LARAVEL
# =========================================================
FROM php:8.3-cli

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libicu-dev \
    libpng-dev \
    && docker-php-ext-install \
        pdo_mysql \
        bcmath \
        intl \
        zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Application Laravel
COPY . .

# Vendor déjà construit
COPY --from=app-build \
    /var/www/html/vendor \
    /var/www/html/vendor

# Build Vite avec manifest.json
COPY --from=vite-build \
    /app/public/build \
    /var/www/html/public/build

RUN test -f /var/www/html/public/build/manifest.json

RUN mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 10000

CMD sh -c "php artisan storage:link || true; php artisan migrate --force; php artisan filament:assets; php artisan optimize; php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"