<x-filament-panels::page>

    @php
        $stats = $this->accountingData;
    @endphp

    <style>
        .duplika-accounting {
            width: 100%;
        }

        .duplika-accounting * {
            box-sizing: border-box;
        }

        .accounting-card {
            background: rgb(24, 24, 27);
            border: 1px solid rgb(39, 39, 42);
            border-radius: 16px;
        }

        .accounting-period {
            padding: 20px 22px;
            margin-bottom: 22px;
        }

        .period-layout {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 24px;
            flex-wrap: wrap;
        }

        .accounting-eyebrow {
            margin: 0;
            color: rgb(161, 161, 170);
            font-size: 12px;
            line-height: 1.2;
            font-weight: 700;
            letter-spacing: .18em;
            text-transform: uppercase;
        }

        .period-value {
            margin: 7px 0 0;
            color: white;
            font-size: 15px;
            font-weight: 700;
        }

        .period-controls {
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: 9px;
        }

        .date-field label {
            display: block;
            margin: 0 0 5px 3px;
            color: rgb(161, 161, 170);
            font-size: 12px;
            font-weight: 600;
        }

        .date-field input {
            width: 178px;
            height: 40px;
            padding: 0 12px;
            color: white;
            background: rgb(39, 39, 42);
            border: 1px solid rgb(63, 63, 70);
            border-radius: 9px;
            outline: none;
            color-scheme: dark;
        }

        .date-field input:focus {
            border-color: #e7ad25;
        }

        .accounting-button {
            height: 40px;
            padding: 0 15px;
            color: white;
            background: rgb(39, 39, 42);
            border: 1px solid rgb(63, 63, 70);
            border-radius: 9px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: .15s ease;
        }

        .accounting-button:hover {
            border-color: #e7ad25;
            background: rgb(50, 50, 54);
        }

        .accounting-stats {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
        }

        .stat-card {
            min-height: 145px;
            padding: 22px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
        }

        .stat-label {
            margin: 0;
            color: rgb(161, 161, 170);
            font-size: 12px;
            line-height: 1.2;
            font-weight: 700;
            letter-spacing: .17em;
            text-transform: uppercase;
        }

        .stat-number {
            margin: 14px 0 0;
            color: white;
            font-size: 28px;
            line-height: 1;
            font-weight: 700;
        }

        .stat-description {
            margin: 17px 0 0;
            color: rgb(161, 161, 170);
            font-size: 14px;
        }

        .stat-icon {
            width: 46px;
            height: 46px;
            min-width: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            color: #e7ad25;
            background: rgba(231, 173, 37, .12);
        }

        .stat-icon svg {
            width: 22px !important;
            height: 22px !important;
            min-width: 22px !important;
            max-width: 22px !important;
            max-height: 22px !important;
            display: block;
        }

        .accounting-bottom {
            display: grid;
            grid-template-columns: 1.2fr .8fr;
            gap: 18px;
            margin-top: 18px;
        }

        .bottom-card {
            min-height: 215px;
            padding: 22px;
        }

        .bottom-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin-bottom: 18px;
        }

        .bottom-title {
            margin: 0;
            color: white;
            font-size: 16px;
            font-weight: 700;
        }

        .day-count {
            color: rgb(161, 161, 170);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .14em;
            text-transform: uppercase;
        }

        .accounting-empty {
            padding: 18px;
            color: rgb(161, 161, 170);
            background: rgb(39, 39, 42);
            border-radius: 11px;
            font-size: 14px;
        }

        .daily-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 12px 0;
            border-bottom: 1px solid rgb(39, 39, 42);
        }

        .daily-row:last-child {
            border-bottom: none;
        }

        .daily-date {
            margin: 0;
            color: white;
            font-size: 14px;
            font-weight: 700;
        }

        .daily-orders {
            margin: 4px 0 0;
            color: rgb(161, 161, 170);
            font-size: 12px;
        }

        .daily-total {
            color: white;
            font-size: 14px;
            font-weight: 700;
            white-space: nowrap;
        }

        .payment-note {
            margin: 14px 0 0;
            color: rgb(113, 113, 122);
            font-size: 12px;
            line-height: 1.6;
        }

        @media (max-width: 900px) {
            .accounting-stats,
            .accounting-bottom {
                grid-template-columns: 1fr;
            }

            .period-layout {
                align-items: stretch;
            }

            .period-controls {
                justify-content: flex-start;
            }
        }

        @media (max-width: 600px) {
            .date-field {
                width: 100%;
            }

            .date-field input {
                width: 100%;
            }

            .accounting-button {
                flex: 1;
            }

            .stat-card {
                min-height: auto;
            }
        }
    </style>


    <div class="duplika-accounting">

        {{-- PÉRIODE --}}
        <section class="accounting-card accounting-period">

            <div class="period-layout">

                <div>
                    <p class="accounting-eyebrow">
                        {{ __('admin.period_analyzed') }}
                    </p>

                    <p class="period-value">
                        {{ $this->periodLabel }}
                    </p>
                </div>


                <div class="period-controls">

                    <div class="date-field">
                        <label for="dateFrom">
                            {{ __('admin.from') }}
                        </label>

                        <input
                            id="dateFrom"
                            type="date"
                            wire:model.live="dateFrom"
                        >
                    </div>


                    <div class="date-field">
                        <label for="dateTo">
                            {{ __('admin.to') }}
                        </label>

                        <input
                            id="dateTo"
                            type="date"
                            wire:model.live="dateTo"
                        >
                    </div>


                    <button
                        type="button"
                        class="accounting-button"
                        wire:click="setToday"
                    >
                        {{ __('admin.today') }}
                    </button>


                    <button
                        type="button"
                        class="accounting-button"
                        wire:click="setLast30Days"
                    >
                        {{ __('admin.thirty_days') }}
                    </button>


                    <button
                        type="button"
                        class="accounting-button"
                        wire:click="setThisMonth"
                    >
                        {{ __('admin.this_month') }}
                    </button>

                </div>

            </div>

        </section>


        {{-- STATISTIQUES --}}
        <section class="accounting-stats">

            <article class="accounting-card stat-card">

                <div>
                    <p class="stat-label">
                        {{ __('admin.revenue') }}
                    </p>

                    <p class="stat-number">
                        {{ number_format($stats['revenue'], 0, ',', ' ') }}
                        FCFA
                    </p>

                    <p class="stat-description">
                        {{ __('admin.paid_orders_period') }}
                    </p>
                </div>

                <div class="stat-icon">
                    <x-heroicon-o-receipt-percent />
                </div>

            </article>


            <article class="accounting-card stat-card">

                <div>
                    <p class="stat-label">
                        {{ __('admin.orders') }}
                    </p>

                    <p class="stat-number">
                        {{ $stats['orders'] }}
                    </p>

                    <p class="stat-description">
                        {{ $stats['pending'] }}
                        {{ __('admin.pending_payment') }}
                    </p>
                </div>

                <div class="stat-icon">
                    <x-heroicon-o-shopping-bag />
                </div>

            </article>


            <article class="accounting-card stat-card">

                <div>
                    <p class="stat-label">
                        {{ __('admin.average_basket') }}
                    </p>

                    <p class="stat-number">
                        {{ number_format($stats['averageBasket'], 0, ',', ' ') }}
                        FCFA
                    </p>

                    <p class="stat-description">
                        {{ __('admin.paid_orders_average') }}
                    </p>
                </div>

                <div class="stat-icon">
                    <x-heroicon-o-credit-card />
                </div>

            </article>


            <article class="accounting-card stat-card">

                <div>
                    <p class="stat-label">
                        {{ __('admin.to_check') }}
                    </p>

                    <p class="stat-number">
                        {{ $stats['cancelled'] }}
                    </p>

                    <p class="stat-description">
                        {{ __('admin.cancelled_or_refunded') }}
                    </p>
                </div>

                <div class="stat-icon">
                    <x-heroicon-o-cube />
                </div>

            </article>

        </section>


        {{-- PARTIE BASSE --}}
        <section class="accounting-bottom">

            <article class="accounting-card bottom-card">

                <div class="bottom-header">

                    <h2 class="bottom-title">
                        {{ __('admin.daily_evolution') }}
                    </h2>

                    <span class="day-count">
                        {{ count($stats['daily']) }}
                        {{ __('admin.days') }}
                    </span>

                </div>


                @if (count($stats['daily']) === 0)

                    <div class="accounting-empty">
                        {{ __('admin.no_sales') }}
                    </div>

                @else

                    <div>

                        @foreach ($stats['daily'] as $day)

                            <div class="daily-row">

                                <div>

                                    <p class="daily-date">
                                        {{ $day['label'] }}
                                    </p>

                                    <p class="daily-orders">
                                        {{ $day['orders'] }}
                                        {{ __('admin.orders') }}
                                    </p>

                                </div>


                                <div class="daily-total">
                                    {{ number_format($day['total'], 0, ',', ' ') }}
                                    FCFA
                                </div>

                            </div>

                        @endforeach

                    </div>

                @endif

            </article>


            <article class="accounting-card bottom-card">

                <div class="bottom-header">

                    <h2 class="bottom-title">
                        {{ __('admin.payment_distribution') }}
                    </h2>

                </div>


                <div class="accounting-empty">
                    {{ __('admin.no_data_period') }}
                </div>


                <p class="payment-note">
                    {{ __('admin.payment_note') }}
                </p>

            </article>

        </section>

    </div>

</x-filament-panels::page>