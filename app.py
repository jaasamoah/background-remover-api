from flask import Flask, render_template, request, send_file, flash, redirect, url_for
from PIL import Image, ImageFilter
from io import BytesIO
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")

# Configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def simple_background_removal(image):
    """
    Simple background removal using PIL.
    This is a basic implementation that removes white/light backgrounds.
    For production use, consider using AI-based solutions like rembg.
    """
    # Convert to RGBA if not already
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    # Get image data
    datas = image.getdata()
    
    newData = []
    # Define threshold for background detection (adjust as needed)
    threshold = 240
    
    for item in datas:
        # If pixel is close to white/light gray, make it transparent
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            newData.append((255, 255, 255, 0))  # Transparent
        else:
            newData.append(item)
    
    # Update image data
    image.putdata(newData)
    return image

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file uploaded', 'error')
            return redirect(request.url)
        
        file = request.files['file']
        if file.filename == '':
            flash('No file selected', 'error')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            try:
                # Open the image using PIL
                image = Image.open(file.stream)
                
                # Check file size by reading the file again
                file.stream.seek(0)
                file_content = file.stream.read()
                if len(file_content) > MAX_FILE_SIZE:
                    flash('File too large. Maximum size is 16MB.', 'error')
                    return redirect(request.url)
                
                # Apply simple background removal
                processed_image = simple_background_removal(image)
                
                # Save processed image to BytesIO
                img_io = BytesIO()
                processed_image.save(img_io, 'PNG')
                img_io.seek(0)
                
                # Generate filename
                filename = file.filename or 'image'
                original_name = filename.rsplit('.', 1)[0]
                output_filename = f'{original_name}_no_bg.png'
                
                flash('Background removed successfully! Note: This is a basic implementation that works best with light backgrounds.', 'success')
                
                return send_file(
                    img_io,
                    mimetype='image/png',
                    as_attachment=True,
                    download_name=output_filename
                )
                
            except Exception as e:
                flash(f'Error processing image: {str(e)}', 'error')
                return redirect(request.url)
        else:
            flash('Invalid file type. Please upload PNG, JPG, JPEG, GIF, BMP, or WebP files.', 'error')
            return redirect(request.url)
    
    return render_template('index.html')

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    flash('File too large. Maximum size is 16MB.', 'error')
    return redirect(url_for('upload_file'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
