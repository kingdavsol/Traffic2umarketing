import { notFound } from 'next/navigation';
import { prisma } from '@traffic2u/database';
import { Utensils, Clock } from 'lucide-react';
import { Card, CardContent, Badge } from '@traffic2u/ui';

interface PageProps {
  params: {
    restaurantSlug: string;
    menuSlug: string;
  };
}

async function getMenu(restaurantSlug: string, menuSlug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) {
    return null;
  }

  const menu = await prisma.menu.findFirst({
    where: {
      slug: menuSlug,
      restaurantId: restaurant.id,
      isPublished: true,
    },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: {
          items: {
            where: { isAvailable: true },
            orderBy: { order: 'asc' },
          },
        },
      },
      restaurant: true,
    },
  });

  if (!menu) {
    return null;
  }

  // Track menu view
  await prisma.menuView.create({
    data: {
      menuId: menu.id,
      userAgent: 'unknown', // In a real app, get from headers
      ipAddress: 'unknown', // In a real app, get from request
    },
  });

  return menu;
}

export default async function PublicMenuPage({ params }: PageProps) {
  const menu = await getMenu(params.restaurantSlug, params.menuSlug);

  if (!menu) {
    notFound();
  }

  const primaryColor = menu.restaurant.primaryColor || '#DC2626';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="text-white py-8 px-4"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="container mx-auto max-w-4xl">
          {menu.restaurant.logo && (
            <img
              src={menu.restaurant.logo}
              alt={menu.restaurant.name}
              className="h-16 w-16 object-contain mb-4 bg-white rounded-lg p-2"
            />
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {menu.restaurant.name}
          </h1>
          <p className="text-xl opacity-90">{menu.name}</p>
          {menu.description && (
            <p className="mt-2 opacity-80">{menu.description}</p>
          )}
        </div>
      </div>

      {/* Restaurant Info */}
      {(menu.restaurant.address || menu.restaurant.phone || menu.restaurant.hours) && (
        <div className="bg-white border-b py-4 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              {menu.restaurant.address && (
                <div>
                  <p className="text-gray-600">Address</p>
                  <p className="font-medium">{menu.restaurant.address}</p>
                </div>
              )}
              {menu.restaurant.phone && (
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium">
                    <a href={`tel:${menu.restaurant.phone}`} className="hover:underline">
                      {menu.restaurant.phone}
                    </a>
                  </p>
                </div>
              )}
              {menu.restaurant.hours && (
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-gray-600 mt-1" />
                  <div>
                    <p className="text-gray-600">Hours</p>
                    <p className="font-medium">{menu.restaurant.hours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menu Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {menu.categories.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No menu items available at this time.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {menu.categories.map((category) => (
              <div key={category.id}>
                {/* Category Header */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>

                {/* Category Items */}
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold">{item.name}</h3>
                              {item.isVegetarian && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Vegetarian
                                </Badge>
                              )}
                              {item.isVegan && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Vegan
                                </Badge>
                              )}
                              {item.isGlutenFree && (
                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                  Gluten-Free
                                </Badge>
                              )}
                              {item.isSpicy && (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  Spicy
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                            )}
                            {item.allergens && item.allergens.length > 0 && (
                              <p className="text-xs text-gray-500">
                                Allergens: {(item.allergens as string[]).join(', ')}
                              </p>
                            )}
                          </div>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded-lg ml-4"
                            />
                          )}
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <div className="text-sm text-gray-500">
                            {item.calories && <span>{item.calories} cal</span>}
                          </div>
                          <div className="text-xl font-bold" style={{ color: primaryColor }}>
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12 py-6 px-4">
        <div className="container mx-auto max-w-4xl text-center text-sm text-gray-600">
          <p>
            Powered by <span className="font-semibold">MenuQR</span>
          </p>
          {menu.restaurant.website && (
            <p className="mt-2">
              <a
                href={menu.restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: primaryColor }}
              >
                Visit our website
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const menu = await getMenu(params.restaurantSlug, params.menuSlug);

  if (!menu) {
    return {
      title: 'Menu Not Found',
    };
  }

  return {
    title: `${menu.name} - ${menu.restaurant.name}`,
    description: menu.description || `View the ${menu.name} at ${menu.restaurant.name}`,
  };
}
