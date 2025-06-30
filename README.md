# Background Remover API


The Background Remover API is a Flask-based web application that allows users to upload images and remove their backgrounds using the `rembg` library. The processed image is returned as a downloadable PNG file. This documentation focuses on the `app.py` file, which serves as the core API, and includes code snippets to explain its key functionalities.

## Flask App Setup

The application uses Flask, a lightweight Python web framework, to handle HTTP requests. The Flask app is initialized with necessary imports and configuration:

```python
from flask import Flask, render_template, request, send_file
from rembg import remove
from PIL import Image
from io import BytesIO

app = Flask(__name__)
```

- **`Flask`**: Initializes the web server.
- **`render_template`**: Renders the HTML interface (`index.html`).
- **`request` and `send_file`**: Handle file uploads and responses.
- **`rembg`, `PIL`, `BytesIO`**: Libraries for background removal and image processing.

## Upload File Route

The primary endpoint is defined at the root URL (`/`), supporting both GET and POST requests:

```python
@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # POST request handling
    return render_template('index.html')
```

- **GET Request**: Returns the `index.html` template, displaying a form for image uploads.
- **POST Request**: Processes the uploaded image (detailed below).

## Background Removal Process

The `upload_file` function handles image processing when a POST request is received. It involves three key steps:

### 1. Validate File Upload

The function first checks if a file is included in the request:

```python
if 'file' not in request.files:
    return 'No file uploaded', 400
file = request.files['file']
if file.filename == '':
    return 'No file selected', 400
```

- Returns a 400 error if no file is uploaded or if the file is empty.

### 2. Process the Image

If a valid file is uploaded, it is opened and its background is removed:

```python
if file:
    input_image = Image.open(file.stream)
    output_image = remove(input_image, post_process_mask=True)
```

- **`Image.open(file.stream)`**: Opens the image using PIL from the file stream.
- **`remove()`**: Uses the `rembg` library to remove the background, with `post_process_mask=True` enhancing the mask quality.

### 3. Return the Processed Image

The processed image is saved to memory and sent back to the user:

```python
img_io = BytesIO()
output_image.save(img_io, 'PNG')
img_io.seek(0)
return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='_rmbg.png')
```

- **`BytesIO`**: Stores the image in memory.
- **`save(img_io, 'PNG')`**: Saves the image in PNG format.
- **`send_file`**: Sends the image as a downloadable file named `_rmbg.png`.

## Running the Application

The application is launched with the following code:

```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5100)
```

- **`host='0.0.0.0'`**: Makes the app accessible externally.
- **`debug=True`**: Enables debug mode for development.
- **`port=5100`**: Runs the server on port 5100.

To run it locally:
1. Clone the repository: `git clone https://github.com/jaasamoah/background-remover-api.git`
2. Install dependencies: `pip install flask rembg pillow`
3. Run the app: `python app.py`
4. Access it at `http://localhost:5100`.

## Conclusion

The `app.py` file powers the Background Remover API by integrating Flask for web functionality, `rembg` for background removal, and PIL for image handling. It provides a simple, efficient way to process images via a web interface, making it a valuable tool for users needing background-free images.
