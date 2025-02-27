from django.apps import AppConfig


class UserpageConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "userpage"
    
    def ready(self):
        import userpage.signals  # noqa: F401