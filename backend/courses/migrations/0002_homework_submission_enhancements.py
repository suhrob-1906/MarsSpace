# Generated manually for homework submission enhancements
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='homeworksubmission',
            name='coins_reward',
            field=models.PositiveIntegerField(default=0, help_text='Coins awarded when accepted'),
        ),
        migrations.AddField(
            model_name='homeworksubmission',
            name='reviewed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='homeworksubmission',
            name='reviewed_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reviewed_submissions', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='homeworksubmission',
            name='file',
            field=models.FileField(upload_to='homework_uploads/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['zip'])]),
        ),
    ]
