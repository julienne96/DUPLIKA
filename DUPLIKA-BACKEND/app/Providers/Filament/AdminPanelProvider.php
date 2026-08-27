<?php

namespace App\Providers\Filament;

use App\Http\Middleware\SetLocale;
use Filament\Enums\ThemeMode;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()

            ->defaultThemeMode(ThemeMode::Light)

            /*
             * Thème personnalisé DUPLIKA.
             */
            ->viteTheme(
                'resources/css/filament/admin/theme.css'
            )

            /*
             * Branding DUPLIKA.
             */
            ->brandName('DUPLIKA')
            ->brandLogo(
                secure_asset('images/logo-duplika.png')
            )
            ->brandLogoHeight('3rem')

            /*
             * Couleur principale Filament.
             */
            ->colors([
                'primary' => Color::Amber,
            ])

            /*
             * Topbar personnalisée :
             * thème clair/sombre,
             * FR / EN,
             * voir le site,
             * déconnexion.
             */
            ->renderHook(
                PanelsRenderHook::TOPBAR_END,
                fn (): string =>
                    view(
                        'filament.components.topbar-actions'
                    )->render()
            )

            /*
             * On garde le menu utilisateur Filament désactivé
             * puisque la déconnexion est déjà dans notre topbar.
             */
            ->userMenu(false)

            /*
             * Ressources.
             */
            ->discoverResources(
                in: app_path('Filament/Resources'),
                for: 'App\Filament\Resources'
            )

            /*
             * Pages.
             */
            ->discoverPages(
                in: app_path('Filament/Pages'),
                for: 'App\Filament\Pages'
            )

            ->pages([
                Dashboard::class,
            ])

            /*
             * Widgets.
             */
            ->discoverWidgets(
                in: app_path('Filament/Widgets'),
                for: 'App\Filament\Widgets'
            )

            ->widgets([
                //
            ])

            /*
             * Middlewares.
             */
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                SetLocale::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])

            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}