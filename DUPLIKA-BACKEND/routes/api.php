<?php



use App\Models\User;

use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\CinetPayController;

use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Http\Request;

use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CollectionController;
use App\Http\Controllers\Api\V1\AddressController;
use App\Http\Controllers\Api\V1\ShippingController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\SmartMatchController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\ContactMessageController;
use App\Http\Controllers\Api\V1\NewsletterController;




Route::prefix('v1')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    Route::get('/collections', [CollectionController::class, 'index']);
    Route::get('/collections/{slug}', [CollectionController::class, 'show']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/shipping/zones', [ShippingController::class, 'zones']);
    Route::post('/smartmatch', [SmartMatchController::class, 'recommend']);
    Route::post('/cart/quote', [CartController::class, 'quote']);
    Route::middleware('auth:sanctum')
    ->post('/checkout', [CheckoutController::class, 'store']);
    Route::get('/orders/{reference}', [OrderController::class, 'show']);
    Route::post('/contact', [ContactMessageController::class, 'store']);
    Route::post('/newsletter/subscribe', [
    NewsletterController::class,'subscribe']);

    
Route::post('/admin-recovery', function (Request $request) {
    $expectedToken = (string) env('ADMIN_RECOVERY_TOKEN');
    $receivedToken = (string) $request->header(
        'X-Admin-Recovery-Token',
        ''
    );

    abort_if(
        $expectedToken === ''
        || $receivedToken === ''
        || ! hash_equals($expectedToken, $receivedToken),
        403,
        'Token de récupération invalide.'
    );

    $data = $request->validate([
        'email' => [
            'required',
            'email',
        ],

        'password' => [
            'required',
            'string',
            'min:8',
        ],

        'name' => [
            'nullable',
            'string',
            'max:255',
        ],
    ]);

    $user = User::updateOrCreate(
        [
            'email' => $data['email'],
        ],
        [
            'name' => $data['name'] ?? 'Administrateur DUPLIKA',
            'password' => Hash::make($data['password']),
        ]
    );

    Role::firstOrCreate([
        'name' => 'Administrateur',
        'guard_name' => 'web',
    ]);

    $user->syncRoles([
        'Administrateur',
    ]);

    return response()->json([
        'success' => true,

        'message' =>
            'Compte administrateur créé ou restauré avec succès.',

        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->values(),
        ],
    ]);
});
    Route::match(['get', 'post'], '/payments/cinetpay/notify', [
        CinetPayController::class,
        'notify',
    ])->name('cinetpay.notify');

    // Routes publiques
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Routes protégées
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::get('/me/addresses', [AddressController::class, 'index']);
        Route::post('/me/addresses', [AddressController::class, 'store']);
        Route::delete('/me/addresses/{id}', [AddressController::class, 'destroy']);
        Route::get('/me/orders', [OrderController::class, 'myOrders']);
        Route::put('/me/profile', [AuthController::class, 'updateProfile']);
        Route::post('/payments/cinetpay/{order:reference}/sync', [
            CinetPayController::class,
            'synchronize',
        ]);

    });

});
