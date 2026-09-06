<?php

namespace App\Filament\Resources\NewsletterSubscribers\Pages;

use App\Filament\Resources\NewsletterSubscribers\NewsletterSubscriberResource;
use App\Filament\Resources\NewsletterSubscribers\Widgets\NewsletterStats;
use App\Mail\NewsletterAnnouncement;
use App\Models\NewsletterSubscriber;
use Filament\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Mail;

class ListNewsletterSubscribers extends ListRecords
{
    protected static string $resource =
        NewsletterSubscriberResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('sendNewsletter')
                ->label('Envoyer une newsletter')
                ->icon('heroicon-o-paper-airplane')
                ->color('primary')
                ->modalHeading('Envoyer une newsletter')
                ->modalDescription(
                    'Le message sera envoyé uniquement aux abonnés actifs.'
                )
                ->form([
                    TextInput::make('subject')
                        ->label('Objet')
                        ->required()
                        ->maxLength(190),

                    TextInput::make('title')
                        ->label('Titre')
                        ->required()
                        ->maxLength(190),

                    Textarea::make('message')
                        ->label('Message')
                        ->required()
                        ->rows(8)
                        ->columnSpanFull(),

                    TextInput::make('button_label')
                        ->label('Texte du bouton')
                        ->placeholder('Exemple : Découvrir la collection')
                        ->maxLength(100),

                    TextInput::make('button_url')
                        ->label('Lien du bouton')
                        ->placeholder('https://...')
                        ->url()
                        ->maxLength(500),
                ])
                ->requiresConfirmation()
                ->modalSubmitActionLabel('Envoyer')
                ->action(function (array $data): void {

                    $subscribers = NewsletterSubscriber::query()
                        ->where('status', 'active')
                        ->get();

                    if ($subscribers->isEmpty()) {
                        Notification::make()
                            ->title('Aucun abonné actif')
                            ->body(
                                'Il n’y a actuellement aucun abonné actif.'
                            )
                            ->warning()
                            ->send();

                        return;
                    }

                    $sent = 0;

                    foreach ($subscribers as $subscriber) {
                        Mail::to($subscriber->email)
                            ->send(
                                new NewsletterAnnouncement(
                                    subjectText: $data['subject'],
                                    title: $data['title'],
                                    messageText: $data['message'],
                                    buttonLabel:
                                        $data['button_label'] ?? null,
                                    buttonUrl:
                                        $data['button_url'] ?? null,
                                )
                            );

                        $sent++;
                    }

                    Notification::make()
                        ->title('Newsletter envoyée')
                        ->body(
                            $sent .
                            ' abonné(s) ont reçu la newsletter.'
                        )
                        ->success()
                        ->send();
                }),
        ];
    }

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

