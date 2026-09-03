import importlib.util
import ipaddress
import socket
from pathlib import Path

MODULE_PATH = Path(__file__).parent / "sync-image.py"

spec = importlib.util.spec_from_file_location("sync_image", MODULE_PATH)
sync_image = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync_image)

_real_getaddrinfo = socket.getaddrinfo


class FakeResponse:
    def __init__(self, status_code=200, headers=None, content=b"", is_redirect=False):
        self.status_code = status_code
        self.headers = headers or {}
        self.content = content
        self.is_redirect = is_redirect

    def raise_for_status(self):
        if self.status_code >= 400:
            raise sync_image.requests.HTTPError(f"{self.status_code} error")


def public_getaddrinfo(host, *args, **kwargs):
    """Fake-resolve symbolic test hostnames to a public IP; let real IP literals
    (e.g. redirect targets like 169.254.169.254) resolve for real, so tests can
    still assert they get rejected as unsafe."""
    try:
        ipaddress.ip_address(host)
        return _real_getaddrinfo(host, *args, **kwargs)
    except ValueError:
        return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("93.184.216.34", 443))]


# --- is_safe_url ---

def test_blocks_loopback():
    assert not sync_image.is_safe_url("https://127.0.0.1/image.png")


def test_blocks_private_ip():
    assert not sync_image.is_safe_url("https://10.0.0.1/image.png")


def test_blocks_link_local_metadata_endpoint():
    assert not sync_image.is_safe_url("https://169.254.169.254/latest/meta-data/")


def test_blocks_http_scheme():
    assert not sync_image.is_safe_url("http://example.com/image.png")


def test_blocks_malformed_url():
    assert not sync_image.is_safe_url("not-a-url")
    assert not sync_image.is_safe_url("https:///no-host")


def test_allows_public_host(monkeypatch):
    monkeypatch.setattr(sync_image.socket, "getaddrinfo", public_getaddrinfo)
    assert sync_image.is_safe_url("https://example.com/image.png")


def test_blocks_unresolvable_host(monkeypatch):
    def raise_gaierror(*args, **kwargs):
        raise socket.gaierror("nope")

    monkeypatch.setattr(sync_image.socket, "getaddrinfo", raise_gaierror)
    assert not sync_image.is_safe_url("https://does-not-resolve.example/image.png")


# --- download() redirect handling ---

def test_download_follows_redirect_to_safe_host(monkeypatch):
    monkeypatch.setattr(sync_image.socket, "getaddrinfo", public_getaddrinfo)

    calls = []

    def fake_get(url, headers, timeout, allow_redirects):
        calls.append(url)
        if url == "https://good1.example/img":
            return FakeResponse(302, {"Location": "https://good2.example/img.png"}, is_redirect=True)
        if url == "https://good2.example/img.png":
            return FakeResponse(200, {"Content-Type": "image/png"}, content=b"IMGDATA")
        raise AssertionError(f"unexpected url {url}")

    monkeypatch.setattr(sync_image.requests, "get", fake_get)

    content, content_type = sync_image.download("https://good1.example/img")
    assert content == b"IMGDATA"
    assert content_type == "image/png"
    assert calls == ["https://good1.example/img", "https://good2.example/img.png"]


def test_download_blocks_redirect_to_unsafe_host(monkeypatch):
    monkeypatch.setattr(sync_image.socket, "getaddrinfo", public_getaddrinfo)

    calls = []

    def fake_get(url, headers, timeout, allow_redirects):
        calls.append(url)
        return FakeResponse(302, {"Location": "https://169.254.169.254/steal"}, is_redirect=True)

    monkeypatch.setattr(sync_image.requests, "get", fake_get)

    content, content_type = sync_image.download("https://good.example/img")
    assert content is None
    assert content_type is None
    # The unsafe redirect target must never be requested.
    assert calls == ["https://good.example/img"]


def test_download_blocks_excessive_redirect_chain(monkeypatch):
    monkeypatch.setattr(sync_image.socket, "getaddrinfo", public_getaddrinfo)

    calls = []

    def fake_get(url, headers, timeout, allow_redirects):
        calls.append(url)
        return FakeResponse(302, {"Location": "https://good.example/next"}, is_redirect=True)

    monkeypatch.setattr(sync_image.requests, "get", fake_get)

    content, content_type = sync_image.download("https://good.example/start", max_redirects=3)
    assert content is None
    assert content_type is None
    assert len(calls) == 4  # initial request + 3 redirect hops
