<?php

namespace App\Filament\Resources\NewsletterSubscribers\Pages;

use App\Filament\Resources\NewsletterSubscribers\NewsletterSubscriberResource;
use App\Filament\Resources\NewsletterSubscribers\Widgets\NewsletterStats;
use App\Models\NewsletterSubscriber;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListNewsletterSubscribers extends ListRecords
{
    protected static string $resource =
        NewsletterSubscriberResource::class;

    protected function getHeaderWidgets(): array
    {
        return [
            NewsletterStats::class,
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('Tous les contacts')
                ->icon('heroicon-o-users')
                ->badge(
                    NewsletterSubscriber::query()->count()
                ),

            'active' => Tab::make('Abonnés actifs')
                ->icon('heroicon-o-envelope')
                ->badge(
                    NewsletterSubscriber::query()
                        ->where('status', 'active')
                        ->count()
                )
                ->badgeColor('success')
                ->modifyQueryUsing(
                    fn (Builder $query): Builder =>
                        $query->where(
                            'status',
                            'active'
                        )
                ),

            'unsubscribed' => Tab::make('Désinscrits')
                ->icon('heroicon-o-user-minus')
                ->badge(
                    NewsletterSubscriber::query()
                        ->where(
                            'status',
                            'unsubscribed'
                        )
                        ->count()
                )
                ->badgeColor('gray')
                ->modifyQueryUsing(
                    fn (Builder $query): Builder =>
                        $query->where(
                            'status',
                            'unsubscribed'
                        )
                ),
        ];
    }

    public function getDefaultActiveTab(): string|int|null
    {
        return 'all';
    }
}