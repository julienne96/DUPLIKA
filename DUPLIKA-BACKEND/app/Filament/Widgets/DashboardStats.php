<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class DashboardStats extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $productsCount = Product::count();

        $ordersCount = Order::count();

        $clientsCount = User::role('Client')->count();

        $lowStockCount = Product::query()
            ->whereColumn('stock', '<=', 'low_stock_threshold')
            ->where('is_active', true)
            ->count();

        return [
            Stat::make(__('admin.products'), $productsCount)
                ->description(__('admin.products_registered'))
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('primary'),

            Stat::make(__('admin.orders'), $ordersCount)
                ->description(__('admin.orders_registered'))
                ->descriptionIcon('heroicon-m-shopping-cart')
                ->color('info'),

            Stat::make(__('admin.clients'), $clientsCount)
                ->description(__('admin.clients_registered'))
                ->descriptionIcon('heroicon-m-users')
                ->color('success'),

            Stat::make(__('admin.low_stock'), $lowStockCount)
                ->description(__('admin.products_to_restock'))
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color(
                    $lowStockCount > 0
                        ? 'danger'
                        : 'success'
                ),
        ];
    }
}