<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasRoles, Notifiable;

    /**
     * Les attributs pouvant être assignés en masse.
     */
    protected $fillable = [
    'name',
    'first_name',
    'last_name',
    'email',
    'phone',
    'password',
];

    /**
     * Les attributs à masquer lors de la sérialisation.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Les casts des attributs.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function canAccessPanel(Panel $panel): bool
{
    return $this->hasAnyRole([
        'Gestionnaire',
        'Administrateur',
    ]);

}
public function addresses(): HasMany
{
    return $this->hasMany(Address::class);
}
public function orders(): HasMany
{
    return $this->hasMany(Order::class);
}
}