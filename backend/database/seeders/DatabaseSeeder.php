<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with dummy data.
     */
    public function run(): void
    {
        // 1. Create 1 Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@smartmall.com'],
            [
                'name' => 'Mall Super Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // 2. Create 3 Shop Owners
        $owner1 = User::firstOrCreate(
            ['email' => 'alex@urbanthreads.com'],
            [
                'name' => 'Alex Turner',
                'password' => Hash::make('password123'),
                'role' => 'shop_owner',
            ]
        );

        $owner2 = User::firstOrCreate(
            ['email' => 'elena@apexgadgets.com'],
            [
                'name' => 'Elena Rostova',
                'password' => Hash::make('password123'),
                'role' => 'shop_owner',
            ]
        );

        $owner3 = User::firstOrCreate(
            ['email' => 'marcus@brewbites.com'],
            [
                'name' => 'Marcus Chen',
                'password' => Hash::make('password123'),
                'role' => 'shop_owner',
            ]
        );

        // 3. Create 3 Shops
        $shop1 = Shop::firstOrCreate(
            ['shop_number' => 'G-101'],
            [
                'shop_name' => 'Urban Threads Boutique',
                'floor_name' => 'Ground Floor',
                'owner_id' => $owner1->id,
                'monthly_rent' => 45000.00,
            ]
        );

        $shop2 = Shop::firstOrCreate(
            ['shop_number' => 'F1-205'],
            [
                'shop_name' => 'Apex Electronics & Tech',
                'floor_name' => 'First Floor',
                'owner_id' => $owner2->id,
                'monthly_rent' => 62000.00,
            ]
        );

        $shop3 = Shop::firstOrCreate(
            ['shop_number' => 'F2-310'],
            [
                'shop_name' => 'Brew & Bites Artisan Cafe',
                'floor_name' => 'Second Floor',
                'owner_id' => $owner3->id,
                'monthly_rent' => 38000.00,
            ]
        );

        // 4. Sample Bills for the 3 shops
        $bills = [
            // Shop 1 Bills
            [
                'shop_id' => $shop1->id,
                'month_year' => '2024-09',
                'rent_amount' => 45000.00,
                'utility_bill' => 4200.00,
                'status' => 'paid',
            ],
            [
                'shop_id' => $shop1->id,
                'month_year' => '2024-10',
                'rent_amount' => 45000.00,
                'utility_bill' => 4850.00,
                'status' => 'paid',
            ],
            [
                'shop_id' => $shop1->id,
                'month_year' => '2024-11',
                'rent_amount' => 45000.00,
                'utility_bill' => 5100.00,
                'status' => 'pending',
            ],

            // Shop 2 Bills
            [
                'shop_id' => $shop2->id,
                'month_year' => '2024-09',
                'rent_amount' => 62000.00,
                'utility_bill' => 7800.00,
                'status' => 'paid',
            ],
            [
                'shop_id' => $shop2->id,
                'month_year' => '2024-10',
                'rent_amount' => 62000.00,
                'utility_bill' => 8300.00,
                'status' => 'paid',
            ],
            [
                'shop_id' => $shop2->id,
                'month_year' => '2024-11',
                'rent_amount' => 62000.00,
                'utility_bill' => 9100.00,
                'status' => 'unpaid',
            ],

            // Shop 3 Bills
            [
                'shop_id' => $shop3->id,
                'month_year' => '2024-09',
                'rent_amount' => 38000.00,
                'utility_bill' => 3200.00,
                'status' => 'paid',
            ],
            [
                'shop_id' => $shop3->id,
                'month_year' => '2024-10',
                'rent_amount' => 38000.00,
                'utility_bill' => 3650.00,
                'status' => 'paid',
            ],
            [
                'shop_id' => $shop3->id,
                'month_year' => '2024-11',
                'rent_amount' => 38000.00,
                'utility_bill' => 3900.00,
                'status' => 'pending',
            ],
        ];

        foreach ($bills as $billData) {
            Bill::firstOrCreate(
                [
                    'shop_id' => $billData['shop_id'],
                    'month_year' => $billData['month_year'],
                ],
                $billData
            );
        }

        // 5. Sample Products for the 3 shops
        $products = [
            // Shop 1 (Apparel / Fashion)
            [
                'shop_id' => $shop1->id,
                'name' => 'Urban Heritage Denim Jacket',
                'barcode' => '8901234001',
                'price' => 3499.00,
                'stock' => 28,
            ],
            [
                'shop_id' => $shop1->id,
                'name' => 'Slim-Fit Oxford Cotton Shirt',
                'barcode' => '8901234002',
                'price' => 1899.00,
                'stock' => 45,
            ],
            [
                'shop_id' => $shop1->id,
                'name' => 'Classic Tailored Chinos',
                'barcode' => '8901234003',
                'price' => 2199.00,
                'stock' => 32,
            ],
            [
                'shop_id' => $shop1->id,
                'name' => 'Genuine Leather Belt',
                'barcode' => '8901234004',
                'price' => 899.00,
                'stock' => 50,
            ],

            // Shop 2 (Electronics & Tech)
            [
                'shop_id' => $shop2->id,
                'name' => 'Pro Wireless ANC Headphones',
                'barcode' => '8902345001',
                'price' => 8990.00,
                'stock' => 22,
            ],
            [
                'shop_id' => $shop2->id,
                'name' => 'Ultra-Fast 65W GaN Charger',
                'barcode' => '8902345002',
                'price' => 1799.00,
                'stock' => 65,
            ],
            [
                'shop_id' => $shop2->id,
                'name' => 'Mechanical RGB Gaming Keyboard',
                'barcode' => '8902345003',
                'price' => 4590.00,
                'stock' => 18,
            ],
            [
                'shop_id' => $shop2->id,
                'name' => 'Precision Bluetooth Mouse',
                'barcode' => '8902345004',
                'price' => 1290.00,
                'stock' => 40,
            ],

            // Shop 3 (Cafe & Bakery)
            [
                'shop_id' => $shop3->id,
                'name' => 'Single Origin Arabica Beans (500g)',
                'barcode' => '8903456001',
                'price' => 950.00,
                'stock' => 35,
            ],
            [
                'shop_id' => $shop3->id,
                'name' => 'Butter Croissant (Pack of 2)',
                'barcode' => '8903456002',
                'price' => 280.00,
                'stock' => 25,
            ],
            [
                'shop_id' => $shop3->id,
                'name' => 'Signature Cold Brew Bottle (300ml)',
                'barcode' => '8903456003',
                'price' => 320.00,
                'stock' => 40,
            ],
            [
                'shop_id' => $shop3->id,
                'name' => 'Matcha Cream Latte Powder',
                'barcode' => '8903456004',
                'price' => 680.00,
                'stock' => 30,
            ],
        ];

        foreach ($products as $productData) {
            Product::firstOrCreate(
                ['barcode' => $productData['barcode']],
                $productData
            );
        }

        // 6. Sample Sales records
        $sales = [
            [
                'shop_id' => $shop1->id,
                'total_amount' => 5398.00,
                'invoice_number' => 'INV-2024-00101',
            ],
            [
                'shop_id' => $shop1->id,
                'total_amount' => 1899.00,
                'invoice_number' => 'INV-2024-00102',
            ],
            [
                'shop_id' => $shop2->id,
                'total_amount' => 10789.00,
                'invoice_number' => 'INV-2024-00201',
            ],
            [
                'shop_id' => $shop2->id,
                'total_amount' => 4590.00,
                'invoice_number' => 'INV-2024-00202',
            ],
            [
                'shop_id' => $shop3->id,
                'total_amount' => 1230.00,
                'invoice_number' => 'INV-2024-00301',
            ],
            [
                'shop_id' => $shop3->id,
                'total_amount' => 950.00,
                'invoice_number' => 'INV-2024-00302',
            ],
        ];

        foreach ($sales as $saleData) {
            Sale::firstOrCreate(
                ['invoice_number' => $saleData['invoice_number']],
                $saleData
            );
        }
    }
}
