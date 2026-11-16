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
     * Authenticate user and issue Sanctum token with role-based abilities.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password credentials.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact Total Office Center administration.',
            ], 403);
        }

        // Define abilities based on role
        $abilities = match ($user->role) {
            'super_admin' => ['*'],
            'accounts_officer' => [
                'floors:read',
                'units:read',
                'leases:read',
                'leases:manage',
                'invoices:manage',
                'parking:read',
                'tickets:read',
                'dashboard:read'
            ],
            'tenant' => [
                'units:read',
                'leases:read',
                'invoices:read',
                'tickets:manage',
                'dashboard:read'
            ],
            'parking_operator' => [
                'parking:manage',
                'dashboard:read'
            ],
            default => ['basic:read'],
        };

        // Create Sanctum token
        $token = $user->createToken('toc_erp_auth_token', $abilities)->plainTextToken;

        $redirectPath = match ($user->role) {
            'super_admin' => '/admin/dashboard',
            'accounts_officer' => '/accounts/dashboard',
            'tenant' => '/tenant/dashboard',
            'parking_operator' => '/parking/dashboard',
            default => '/dashboard',
        };

        return response()->json([
            'success' => true,
            'message' => 'Login successful. Welcome to Total Office Center ERP.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'is_active' => $user->is_active,
            ],
            'abilities' => $abilities,
            'redirect_path' => $redirectPath,
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        // Load active lease if tenant
        if ($user->role === 'tenant') {
            $user->load(['leases.unit.floor', 'maintenanceTickets']);
        }

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    /**
     * Logout and revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out.',
        ]);
    }

    /**
     * List all system users (restricted to super_admin and accounts_officer).
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(25);

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    /**
     * Create a new user account (e.g. tenant or staff account).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:191',
            'email' => 'required|email|max:191|unique:users,email',
            'phone' => ['nullable', 'string', 'regex:/^(?:\+8801|01)[3-9]\d{8}$/'],
            'role' => 'required|in:super_admin,accounts_officer,tenant,parking_operator',
            'password' => 'required|string|min:6',
            'is_active' => 'nullable|boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} created successfully.",
            'user' => $user,
        ], 201);
    }
}
