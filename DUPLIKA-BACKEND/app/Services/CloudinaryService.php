<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use RuntimeException;

class CloudinaryService
{
    private Cloudinary $cloudinary;

    public function __construct()
    {
        $url = (string) config('cloudinary.url');

        if ($url === '') {
            throw new RuntimeException(
                'Configuration Cloudinary manquante.'
            );
        }

        $this->cloudinary = new Cloudinary($url);
    }

    /**
     * Upload une image vers Cloudinary.
     *
     * @return array{
     *     url:string,
     *     public_id:string
     * }
     */
    public function uploadImage(
        string $filePath,
        string $folder = 'duplika'
    ): array {
        if (! is_file($filePath)) {
            throw new RuntimeException(
                'Le fichier à envoyer vers Cloudinary est introuvable.'
            );
        }

        $result = $this->cloudinary
            ->uploadApi()
            ->upload(
                $filePath,
                [
                    'folder' => $folder,
                    'resource_type' => 'image',
                ]
            );

        $secureUrl = (string) ($result['secure_url'] ?? '');
        $publicId = (string) ($result['public_id'] ?? '');

        if ($secureUrl === '' || $publicId === '') {
            throw new RuntimeException(
                'Cloudinary n’a pas retourné une réponse valide.'
            );
        }

        return [
            'url' => $secureUrl,
            'public_id' => $publicId,
        ];
    }

    /**
     * Supprime une image Cloudinary.
     */
    public function deleteImage(
        string $publicId
    ): void {
        if ($publicId === '') {
            return;
        }

        $this->cloudinary
            ->uploadApi()
            ->destroy(
                $publicId,
                [
                    'resource_type' => 'image',
                    'invalidate' => true,
                ]
            );
    }
}