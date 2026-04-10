from django.conf.urls import url
from statistics_app import views

app_name = "statistics_app"

urlpatterns = [
    url(r'^public/?$', views.workshop_public_stats, name="public"),
    url(r'^api/public/?$', views.workshop_public_stats_api, name="api_public"),
    url(r'^team/?$', views.team_stats, name="team"),
    url(r'^team/(?P<team_id>\d+)/?$', views.team_stats, name="team"),
]
