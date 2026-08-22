<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'status',
        'read_at',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }
}