<?php

namespace App\Filament\Pages;

use App\Models\Order;
use BackedEnum;
use Carbon\Carbon;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Collection;

class Accounting extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBanknotes;

    

    protected static ?int $navigationSort = 20;

    protected string $view = 'filament.pages.accounting';

    public string $dateFrom = '';
    public string $dateTo = '';

    public function mount(): void
    {
        abort_unless(
            auth()->user()?->hasRole('Administrateur'),
            403
        );

        $this->dateFrom = now()->startOfMonth()->format('Y-m-d');
        $this->dateTo = now()->format('Y-m-d');
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasRole('Administrateur') ?? false;
    }

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()?->hasRole('Administrateur') ?? false;
    }

    public function setToday(): void
    {
        $this->dateFrom = now()->format('Y-m-d');
        $this->dateTo = now()->format('Y-m-d');
    }

    public function setLast30Days(): void
    {
        $this->dateFrom = now()->subDays(29)->format('Y-m-d');
        $this->dateTo = now()->format('Y-m-d');
    }

    public function setThisMonth(): void
    {
        $this->dateFrom = now()->startOfMonth()->format('Y-m-d');
        $this->dateTo = now()->format('Y-m-d');
    }

    protected function ordersQuery()
    {
        $from = Carbon::parse($this->dateFrom)->startOfDay();
        $to = Carbon::parse($this->dateTo)->endOfDay();

        return Order::query()
            ->whereBetween('created_at', [$from, $to]);
    }

    public function getAccountingDataProperty(): array
    {
        $orders = $this->ordersQuery()->get();

     

        /*
         * Pour le chiffre d'affaires réellement encaissé,
         * on ne prend que les commandes payées ou plus avancées.
         */
        $paidOrders = $orders->whereIn('status', [
            'payee',
            'en_preparation',
            'expediee',
            'livree',
        ]);

        $revenue = (int) $paidOrders->sum('total');

       $orderCount = $paidOrders->count();

        $averageBasket = $paidOrders->count() > 0
            ? (int) round($revenue / $paidOrders->count())
            : 0;

        $pendingCount = $orders
            ->where('status', 'en_attente_paiement')
            ->count();

        $cancelledCount = $orders
            ->whereIn('status', ['annulee', 'remboursee'])
            ->count();

        return [
            'revenue' => $revenue,
            'orders' => $orderCount,
            'averageBasket' => $averageBasket,
            'pending' => $pendingCount,
            'cancelled' => $cancelledCount,
            'daily' => $this->dailyRevenue($paidOrders),
        ];
    }

    protected function dailyRevenue(Collection $orders): array
    {
        return $orders
            ->groupBy(fn ($order) => $order->created_at->format('Y-m-d'))
            ->map(function (Collection $dayOrders, string $date) {
                return [
                    'date' => $date,
                    'label' => Carbon::parse($date)->translatedFormat('d M'),
                    'total' => (int) $dayOrders->sum('total'),
                    'orders' => $dayOrders->count(),
                ];
            })
            ->sortKeys()
            ->values()
            ->all();
    }

    public function getPeriodLabelProperty(): string
    {
        if (!$this->dateFrom || !$this->dateTo) {
            return '';
        }

        return Carbon::parse($this->dateFrom)->format('d/m/Y')
            . ' au '
            . Carbon::parse($this->dateTo)->format('d/m/Y');
    }
    public static function getNavigationLabel(): string
{
    return __('admin.accounting');
}

public function getTitle(): string
{
    return __('admin.accounting');
}
}