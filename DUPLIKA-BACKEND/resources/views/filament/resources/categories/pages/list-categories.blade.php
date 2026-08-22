<x-filament-panels::page>

    <style>
        .duplika-categories {
            width: 100%;
        }

        .category-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 22px;
        }

        .category-card {
            position: relative;
            overflow: hidden;
            background: rgb(24, 24, 27);
            border: 1px solid rgb(39, 39, 42);
            border-radius: 18px;
            transition:
                transform .18s ease,
                border-color .18s ease,
                box-shadow .18s ease;
        }

        .category-card:hover {
            transform: translateY(-3px);
            border-color: rgba(231, 173, 37, .60);
            box-shadow: 0 12px 30px rgba(0, 0, 0, .22);
        }

        .category-image-wrap {
            width: 100%;
            height: 205px;
            overflow: hidden;
            background: rgb(39, 39, 42);
        }

        .category-image {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform .3s ease;
        }

        .category-card:hover .category-image {
            transform: scale(1.025);
        }

        .category-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgb(113, 113, 122);
        }

        .category-placeholder svg {
            width: 46px !important;
            height: 46px !important;
        }

        .category-content {
            padding: 19px 20px 21px;
        }

        .category-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 14px;
        }

        .category-name {
            margin: 0;
            color: white;
            font-size: 17px;
            line-height: 1.35;
            font-weight: 700;
        }

        .category-count {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 7px 11px;
            color: #e7ad25;
            background: rgba(231, 173, 37, .12);
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
        }

        .category-description {
            margin: 11px 0 0;
            color: rgb(161, 161, 170);
            font-size: 14px;
            line-height: 1.6;
            min-height: 44px;
        }

        .category-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-top: 18px;
            padding-top: 15px;
            border-top: 1px solid rgb(39, 39, 42);
        }

        .category-status {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: rgb(161, 161, 170);
            font-size: 12px;
            font-weight: 600;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
        }

        .status-dot.active {
            background: rgb(34, 197, 94);
        }

        .status-dot.inactive {
            background: rgb(239, 68, 68);
        }

        .category-edit {
            position: relative;
            z-index: 3;
            color: #e7ad25;
            font-size: 12px;
            font-weight: 700;
            text-decoration: none;
        }

        .category-edit:hover {
            text-decoration: underline;
        }

        .category-card-link {
            position: absolute;
            inset: 0;
            z-index: 2;
        }

        .empty-categories {
            padding: 65px 25px;
            text-align: center;
            background: rgb(24, 24, 27);
            border: 1px dashed rgb(63, 63, 70);
            border-radius: 18px;
        }

        .empty-icon {
            width: 52px;
            height: 52px;
            margin: 0 auto 15px;
            color: rgb(113, 113, 122);
        }

        .empty-icon svg {
            width: 52px !important;
            height: 52px !important;
        }

        .empty-title {
            margin: 0;
            color: white;
            font-size: 17px;
            font-weight: 700;
        }

        .empty-text {
            margin: 8px 0 0;
            color: rgb(161, 161, 170);
            font-size: 14px;
        }

        @media (max-width: 1100px) {
            .category-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        @media (max-width: 680px) {
            .category-grid {
                grid-template-columns: 1fr;
            }

            .category-image-wrap {
                height: 220px;
            }
        }
    </style>


    <div class="duplika-categories">

        @if ($this->categories->count() > 0)

            <div class="category-grid">

                @foreach ($this->categories as $category)

                    @php
                        $imageUrl = null;

                        if ($category->image) {
                            if (
                                str_starts_with($category->image, 'http://') ||
                                str_starts_with($category->image, 'https://')
                            ) {
                                $imageUrl = $category->image;
                            } else {
                                $imageUrl = asset(
                                    'storage/' . ltrim($category->image, '/')
                                );
                            }
                        }

                        $editUrl =
                            \App\Filament\Resources\Categories\CategoryResource::getUrl(
                                'edit',
                                [
                                    'record' => $category,
                                ]
                            );
                    @endphp


                    <article class="category-card">

                        <a
                            href="{{ $editUrl }}"
                            class="category-card-link"
                            aria-label="{{ __('admin.edit') }} {{ $category->name }}"
                        ></a>


                        {{-- Image --}}
                        <div class="category-image-wrap">

                            @if ($imageUrl)

                                <img
                                    src="{{ $imageUrl }}"
                                    alt="{{ $category->name }}"
                                    class="category-image"
                                >

                            @else

                                <div class="category-placeholder">
                                    <x-heroicon-o-photo />
                                </div>

                            @endif

                        </div>


                        {{-- Contenu --}}
                        <div class="category-content">

                            <div class="category-heading">

                                <h2 class="category-name">
                                    {{ $category->name }}
                                </h2>


                                <span class="category-count">

                                    @if ($category->products_count === 1)

                                        {{ $category->products_count }}
                                        {{ __('admin.product_singular') }}

                                    @else

                                        {{ $category->products_count }}
                                        {{ __('admin.product_plural') }}

                                    @endif

                                </span>

                            </div>


                            <p class="category-description">
                                {{ $category->description ?: __('admin.no_description') }}
                            </p>


                            <div class="category-footer">

                                <span class="category-status">

                                    <span
                                        class="status-dot {{ $category->is_active ? 'active' : 'inactive' }}"
                                    ></span>

                                    {{ $category->is_active
                                        ? __('admin.category_active')
                                        : __('admin.category_inactive') }}

                                </span>


                                <a
                                    href="{{ $editUrl }}"
                                    class="category-edit"
                                >
                                    {{ __('admin.edit') }}
                                </a>

                            </div>

                        </div>

                    </article>

                @endforeach

            </div>

        @else

            <div class="empty-categories">

                <div class="empty-icon">
                    <x-heroicon-o-squares-2x2 />
                </div>

                <h2 class="empty-title">
                    {{ __('admin.no_categories') }}
                </h2>

                <p class="empty-text">
                    {{ __('admin.create_first_category') }}
                </p>

            </div>

        @endif

    </div>

</x-filament-panels::page>