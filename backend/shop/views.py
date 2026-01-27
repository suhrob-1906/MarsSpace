from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from .models import ShopItem, Order, OrderItem
from .serializers import ShopItemSerializer, OrderSerializer
from django.db import transaction

class ShopItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ShopItem.objects.filter(is_active=True)
    serializer_class = ShopItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class AdminShopItemViewSet(viewsets.ModelViewSet):
    """ViewSet for admins to manage shop items"""
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ShopItemSerializer
    queryset = ShopItem.objects.all()

class BuyItemView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        item_id = request.data.get('item_id')
        try:
            item = ShopItem.objects.get(id=item_id, is_active=True)
        except ShopItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        student = request.user
        
        if student.coins < item.price_coins:
            return Response({'error': 'Not enough coins'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            student.coins -= item.price_coins
            student.save()
            
            # Simple single item order for MVP
            order = Order.objects.create(student=student, total_coins=item.price_coins)
            OrderItem.objects.create(order=order, shop_item=item, qty=1, price_coins=item.price_coins)
            
        return Response({'success': True, 'new_balance': student.coins})

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(student=self.request.user)
