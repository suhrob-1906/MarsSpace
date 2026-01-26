from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShopItemViewSet, OrderViewSet, BuyItemView, AdminShopItemViewSet

router = DefaultRouter()
router.register(r'shop/items', ShopItemViewSet)
router.register(r'shop/history', OrderViewSet, basename='history')
router.register(r'admin/shop/items', AdminShopItemViewSet, basename='admin-shop-items')

urlpatterns = [
    path('', include(router.urls)),
    path('shop/buy/', BuyItemView.as_view(), name='shop-buy'),
]
