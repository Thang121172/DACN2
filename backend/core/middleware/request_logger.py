from django.conf import settings


class RequestLoggerMiddleware:
    """Debug middleware to print request details for API troubleshooting.

    Only prints in DEBUG to avoid leaking data in production.
    Logs method, path, content-type, content-length and a repr() of the body for paths under /api/accounts/.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            if getattr(settings, 'DEBUG', False) and request.path.startswith('/api/accounts/'):
                # safe introspection of headers and body
                ct = request.META.get('CONTENT_TYPE', '')
                cl = request.META.get('CONTENT_LENGTH', '0')
                try:
                    body = request.body.decode('utf-8') if request.body else ''
                except Exception:
                    # binary or non-decodable
                    body = repr(request.body)[:1000]
                print(f"[reqdbg] {request.method} {request.path} CT={ct} CL={cl} BODY={body}")
        except Exception as e:
            # Never let logging break the request handling
            print(f"[reqdbg] logging error: {e}")

        return self.get_response(request)
