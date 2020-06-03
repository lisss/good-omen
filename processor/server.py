from http.server import HTTPServer, BaseHTTPRequestHandler
import ssl
from io import BytesIO
import json
import requests
from bs4 import BeautifulSoup


def get_is_valid_article(title, text, ind):
    # TODO: predict from classifier
    return True if ind != 2 else False


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b'Hello, world!!!')

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        response = BytesIO()
        try:
            body_params = json.loads(body)
            article_input_data = body_params.get('articleInputData')
            resp_data = []
            if article_input_data:
                for i, article_input in enumerate(article_input_data):
                    article_url = article_input.get('url')
                    if article_url:
                        html = requests.get(article_url).text
                        soup = BeautifulSoup(html)
                        title = soup.title.string
                        text_class_name = article_input.get('textClass')

                        text = None
                        if text_class_name:
                            text_el = soup.find(
                                True, {'class': text_class_name})
                            # TODO: don't join
                            text = ' '.join(list(text_el.stripped_strings))
                        resp_data.append({
                            'articleUrl': article_url,
                            'title': title,
                            'isValid': get_is_valid_article(title, text, i)
                        })

            response.write(json.dumps(
                resp_data, ensure_ascii=False).encode('utf-8'))

            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(response.getvalue())
        except Exception as e:
            response.write(str(e).encode('utf-8'))
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(response.getvalue())


httpd = HTTPServer(('localhost', 4443), SimpleHTTPRequestHandler)

httpd.socket = ssl.wrap_socket(httpd.socket,
                               keyfile="./key.pem",
                               certfile='./cert.pem', server_side=True)

httpd.serve_forever()
