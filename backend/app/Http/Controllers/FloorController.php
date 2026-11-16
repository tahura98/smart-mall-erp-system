<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FloorController extends Controller
{
    /**
     * Display a listing of all floors with unit statistics.
     */
    public function index(): JsonResponse
    {
        $floors = Floor::withCount([
            'units',
            'units as occupied_units_count' => function ($query) {
                $query->where('status', 'Occupied');
            },
            'units as vacant_units_count' => function ($query) {
                $query->where('status', 'Vacant');
            },
            'units as maintenance_units_count' => function ($query) {
                $query->where('status', 'Maintenance');
            },
        ])->get();

        return response()->json([
            'success' => true,
            'floors' => $floors,
        ]);
    }

    /**
     * Store a newly created floor in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'level_name' => 'required|string|max:100',
            'zone_type' => 'required|in:Shopping Mall,Food Court,Corporate Office,Basement Parking,Rooftop Lounge',
            'block_code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('floors')->where(function ($query) use ($request) {
                    return $query->where('level_name', $request->level_name)
                                 ->where('block_code', $request->block_code);
                }),
            ],
            'description' => 'nullable|string',
        ]);

        $floor = Floor::create($validated);

        return response()->json([
            'success' => true,
            'message' => "Floor '{$floor->level_name}' created successfully.",
            'floor' => $floor,
        ], 201);
    }

    /**
     * Display the specified floor with units.
     */
    public function show(int $id): JsonResponse
    {
        $floor = Floor::with(['units.activeLease'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'floor' => $floor,
        ]);
    }

    /**
     * Update the specified floor.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $floor = Floor::findOrFail($id);

        $validated = $request->validate([
            'level_name' => 'required|string|max:100',
            'zone_type' => 'required|in:Shopping Mall,Food Court,Corporate Office,Basement Parking,Rooftop Lounge',
            'block_code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('floors')->where(function ($query) use ($request, $floor) {
                    return $query->where('level_name', $request->level_name)
                                 ->where('block_code', $request->block_code)
                                 ->where('id', '!=', $floor->id);
                }),
            ],
            'description' => 'nullable|string',
        ]);

        $floor->update($validated);

        return response()->json([
            'success' => true,
            'message' => "Floor '{$floor->level_name}' updated successfully.",
            'floor' => $floor,
        ]);
    }

    /**
     * Remove the specified floor from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $floor = Floor::withCount('units')->findOrFail($id);

        if ($floor->units_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete floor '{$floor->level_name}' because it contains {$floor->units_count} active units. Please reassign or delete units first.",
            ], 422);
        }

        $floor->delete();

        return response()->json([
            'success' => true,
            'message' => "Floor '{$floor->level_name}' deleted successfully.",
        ]);
    }
}
