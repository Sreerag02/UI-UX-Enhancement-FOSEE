import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.contrib.auth import authenticate, login


@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})


@csrf_exempt
def api_login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)

    username = request.POST.get('username') or json.loads(request.body).get('username', '')
    password = request.POST.get('password') or json.loads(request.body).get('password', '')
    user = authenticate(username=username, password=password)

    if user is None:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

    if not user.profile.is_email_verified:
        return JsonResponse({'error': 'Email not verified'}, status=403)

    login(request, user)
    return JsonResponse({'redirect': '/workshop/dashboard'})
