<div
    style="
        display:flex;
        align-items:center;
        gap:8px;
        margin-right:10px;
    "
>
    {{-- Mode clair / sombre --}}
    <button
        type="button"
        x-data="{
            dark: document.documentElement.classList.contains('dark')
        }"
        x-on:click="
            dark = ! dark;

            const newTheme = dark ? 'dark' : 'light';

            localStorage.setItem('theme', newTheme);

            if (dark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            window.dispatchEvent(
                new CustomEvent('theme-changed', {
                    detail: newTheme
                })
            );
        "
        x-on:theme-changed.window="
            dark = $event.detail === 'dark'
        "
        title="{{ app()->getLocale() === 'fr'
            ? 'Changer le thème'
            : 'Change theme' }}"
        style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            width:38px;
            height:36px;
            border:1px solid rgb(113,113,122);
            border-radius:9px;
            background:transparent;
            color:inherit;
            cursor:pointer;
        "
    >
        {{-- Icône lune quand le mode clair est actif --}}
        <span
            x-show="! dark"
            style="display:flex;"
        >
            <x-heroicon-o-moon
                style="width:19px;height:19px;"
            />
        </span>

        {{-- Icône soleil quand le mode sombre est actif --}}
        <span
            x-show="dark"
            x-cloak
            style="display:flex;"
        >
            <x-heroicon-o-sun
                style="width:19px;height:19px;"
            />
        </span>
    </button>

    {{-- Français --}}
    <a
        href="{{ route('locale.switch', ['locale' => 'fr']) }}"
        title="Français"
        style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            height:36px;
            min-width:42px;
            padding:0 10px;
            border:1px solid {{ app()->getLocale() === 'fr'
                ? 'rgb(245,158,11)'
                : 'rgb(113,113,122)' }};
            border-radius:9px;
            font-size:12px;
            font-weight:700;
            text-decoration:none;
            color:inherit;
        "
    >
        FR
    </a>

    {{-- English --}}
    <a
        href="{{ route('locale.switch', ['locale' => 'en']) }}"
        title="English"
        style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            height:36px;
            min-width:42px;
            padding:0 10px;
            border:1px solid {{ app()->getLocale() === 'en'
                ? 'rgb(245,158,11)'
                : 'rgb(113,113,122)' }};
            border-radius:9px;
            font-size:12px;
            font-weight:700;
            text-decoration:none;
            color:inherit;
        "
    >
        EN
    </a>

    {{-- Retour vers la boutique --}}
    <a
        href="{{ config('app.frontend_url', 'http://localhost:5173') }}"
        target="_blank"
        rel="noopener noreferrer"
        style="
            display:inline-flex;
            align-items:center;
            gap:6px;
            height:36px;
            padding:0 12px;
            border:1px solid rgb(113,113,122);
            border-radius:9px;
            font-size:13px;
            font-weight:600;
            text-decoration:none;
            color:inherit;
        "
    >
        <x-heroicon-o-arrow-top-right-on-square
            style="width:17px;height:17px;"
        />

        <span>
            {{ app()->getLocale() === 'fr'
                ? 'Voir le site'
                : 'View website' }}
        </span>
    </a>

    {{-- Déconnexion --}}
    <form
        method="POST"
        action="{{ filament()->getLogoutUrl() }}"
        style="margin:0;"
    >
        @csrf

        <button
            type="submit"
            style="
                display:inline-flex;
                align-items:center;
                gap:6px;
                height:36px;
                padding:0 12px;
                border:1px solid rgb(239,68,68);
                border-radius:9px;
                color:rgb(239,68,68);
                background:transparent;
                font-size:13px;
                font-weight:600;
                cursor:pointer;
            "
        >
            <x-heroicon-o-arrow-right-start-on-rectangle
                style="width:17px;height:17px;"
            />

            <span>
                {{ app()->getLocale() === 'fr'
                    ? 'Déconnexion'
                    : 'Log out' }}
            </span>
        </button>
    </form>
</div>