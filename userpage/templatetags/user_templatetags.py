from django import template
from django.contrib.auth.models import Group

register = template.Library()

@register.filter(name='has_group')
def has_group(user, group_name):
    return user.groups.filter(name=group_name).exists()

@register.filter(name='is_moderator')
def is_moderator(user):
    return user.groups.filter(name="Moderator").exists()

