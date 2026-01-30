# Generated manually for adding last_wpm field to User model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_studygroup_teacher'),  # Fixed: correct parent migration
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_wpm',
            field=models.FloatField(default=0, help_text='Last typing speed (words per minute)'),
        ),
    ]
