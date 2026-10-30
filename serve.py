"""Run the MedStock static app on this computer's loopback interface."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import webbrowser


HOST = "127.0.0.1"
FIRST_PORT = 8765
LAST_PORT = 8790
APP_DIR = Path(__file__).resolve().parent


def main() -> None:
    os.chdir(APP_DIR)
    server = None
    for port in range(FIRST_PORT, LAST_PORT + 1):
        try:
            server = ThreadingHTTPServer((HOST, port), SimpleHTTPRequestHandler)
            break
        except OSError:
            continue

    if server is None:
        raise SystemExit(f"No free localhost port found between {FIRST_PORT} and {LAST_PORT}.")

    url = f"http://{HOST}:{server.server_port}/"
    print(f"MedStock is running at {url}", flush=True)
    print("Keep this window open. Press Ctrl+C here to stop the server.", flush=True)
    webbrowser.open_new_tab(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nMedStock server stopped.", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

