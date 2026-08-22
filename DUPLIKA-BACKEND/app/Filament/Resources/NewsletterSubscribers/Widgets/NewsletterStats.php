<?php

namespace App\Filament\Resources\NewsletterSubscribers\Widgets;

use App\Models\NewsletterSubscriber;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class NewsletterStats extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $total = NewsletterSubscriber::query()->count();

        $active = NewsletterSubscriber::query()
            ->where('status', 'active')
            ->count();

        $unsubscribed = NewsletterSubscriber::query()
            ->where('status', 'unsubscribed')
            ->count();

        return [
            Stat::make('Total contacts', $total)
                ->description('Adresses enregistrées')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),

            Stat::make('Abonnés actifs', $active)
                ->description('Reçoivent la newsletter')
                ->descriptionIcon('heroicon-m-envelope')
                ->color('success'),

            Stat::make('Désinscrits', $unsubscribed)
                ->description('Contacts désactivés')
                ->descriptionIcon('heroicon-m-user-minus')
                ->color('gray'),
        ];
    }
}