from django.db import models
from django.conf import settings

class ShopItem(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image_url = models.CharField(max_length=500, blank=True) # or FileField, simpler for MVP
    price_coins = models.PositiveIntegerField()
    stock = models.IntegerField(default=999)
    category = models.CharField(max_length=50, default='General')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class Order(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='orders', on_delete=models.CASCADE)
    total_coins = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.student.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    shop_item = models.ForeignKey(ShopItem, on_delete=models.CASCADE)
    qty = models.PositiveIntegerField(default=1)
    price_coins = models.PositiveIntegerField() # price at moment of purchase
