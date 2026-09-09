<?php

use App\Http\Controllers\LocaleController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/locale/{locale}', [LocaleController::class, 'switch'])
    ->whereIn('locale', ['fr', 'en'])
    ->name('locale.switch');

Route::get('/debug/egress', function () {
    $response = Http::get('https://api.ipify.org?format=json');

    return $response->json();
});