<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Vider le cache des permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | Rôles DUPLIKA
        |--------------------------------------------------------------------------
        */
        $client = Role::firstOrCreate([
            'name' => 'Client',
            'guard_name' => 'web',
        ]);

        $gestionnaire = Role::firstOrCreate([
            'name' => 'Gestionnaire',
            'guard_name' => 'web',
        ]);

        $administrateur = Role::firstOrCreate([
            'name' => 'Administrateur',
            'guard_name' => 'web',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Permissions d'administration
        |--------------------------------------------------------------------------
        */
        $permissions = [
            'users.view',
            'users.create',
            'users.update',
            'users.delete',

            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',
            'roles.assign',

            'permissions.view',
            'permissions.manage',

            'settings.view',
            'settings.manage',

            'audit.view',
        ];

        /*
        |--------------------------------------------------------------------------
        | Création des permissions
        |--------------------------------------------------------------------------
        */
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Administrateur
        |--------------------------------------------------------------------------
        */
        $administrateur->syncPermissions($permissions);

        /*
        |--------------------------------------------------------------------------
        | Nettoyage du cache
        |--------------------------------------------------------------------------
        */
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}