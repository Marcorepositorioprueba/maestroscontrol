import http.server
import socketserver
import urllib.request
import os

PORT = 8000
# URL del CSV de Google Sheets
CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYKFqKbYzn2Z1mTvCrqkfWoWuvRMWvPybiYzkCkKbCKwrmkqeK9B8RhS91Ha3UBE2XNXMrimxvqqRl/pub?gid=1641359749&single=true&output=csv"

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Si el navegador pide '/get_csv', vamos a buscarlo a Google Sheets
        if self.path == '/get_csv':
            try:
                # Usamos un user-agent para simular un navegador normal
                req = urllib.request.Request(CSV_URL, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    if response.status == 200:
                        self.send_response(200)
                        self.send_header('Content-type', 'text/csv; charset=utf-8')
                        self.end_headers()
                        self.wfile.write(response.read())
                    else:
                        # Si Google da un error, se lo pasamos al navegador
                        self.send_error(response.status, f"Error al contactar Google Sheets: {response.reason}")
            except Exception as e:
                self.send_error(500, f"Error en el servidor proxy: {e}")
        else:
            # Para cualquier otra petición (dashboard.html, escudo1.png), servimos los archivos locales
            super().do_GET()

# Nos aseguramos de que el servidor se ejecute en el directorio correcto
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), ProxyHandler) as httpd:
    print(f"Servidor iniciado en http://localhost:{PORT}")
    print(f"Abre http://localhost:{PORT}/dashboard.html en tu navegador.")
    print("Presiona Ctrl+C para detener el servidor.")
    httpd.serve_forever()
