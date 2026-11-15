<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate user and issue a Laravel Sanctum personal access token.
     * Returns user details including role ('admin' | 'shop_owner') and token.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Generate Sanctum plain text token with abilities matching user's role
        $token = $user->createToken('auth_token', [$user->role])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Authenticated successfully.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role, // 'admin' or 'shop_owner'
            ],
        ]);
    }

    /**
     * Invalidate the authenticated user's current Sanctum access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully. Token has been revoked.',
        ]);
    }

    /**
     * Get details of the currently authenticated user with role & shop context.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'shop_owner') {
            $user->load('shops');
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'shops' => $user->shops ?? [],
            ],
        ]);
    }
}
