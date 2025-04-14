# WikiTruth: Wikipedia Research Assistant

WikiTruth is a mobile-friendly Flask web application that enables users to search, read, translate, and collaboratively review Wikipedia articles.

![WikiTruth Screenshot](static/images/wiki-truth-screenshot.png)

## Features

- **Powerful Wikipedia Search**: Search and browse Wikipedia articles in multiple languages
- **Multi-language Support**: View articles in their original language and effortlessly switch between available translations
- **Progressive Translation**: Translate articles section-by-section, making it easier to compare original and translated content
- **Collaborative Review**: Highlight and mark text for review, then view all highlights in a special review mode
- **Mobile-first Design**: Optimized for mobile devices with clean, responsive interface
- **Document Export**: Download articles as Word documents in original or translated form
- **Social Sharing**: Easily share articles via X (Twitter), Facebook, LinkedIn, WhatsApp, Telegram, and Email
- **Clean Reading Experience**: Tabbed interface separates summary and full content for better readability

## Getting Started

### Prerequisites

- Python 3.10 or newer
- pip (Python package installer)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/wiki-truth.git
cd wiki-truth
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Run the application**

```bash
python main.py
```

4. **Access the application**

Open your browser and navigate to:
```
http://localhost:5000
```

### Deployment on Windows

1. **Install Python 3.10+ from the [official website](https://www.python.org/downloads/)**

2. **Open Command Prompt as Administrator**

3. **Navigate to your project folder**

```cmd
cd path\to\wiki-truth
```

4. **Create a virtual environment (optional but recommended)**

```cmd
python -m venv venv
venv\Scripts\activate
```

5. **Install dependencies**

```cmd
pip install -r requirements.txt
```

6. **Set environment variable for production**

```cmd
set FLASK_ENV=production
```

7. **Run the application**

```cmd
python main.py
```
Or for production use with gunicorn:
```cmd
gunicorn --bind 0.0.0.0:5000 main:app
```

8. **Access the application**

Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

1. **Search for Articles**
   - Enter a search term in the search box on the home page
   - Select from the search results

2. **Reading Articles**
   - Articles display in a tabbed interface: Summary and Full Content
   - Table of Contents provides easy navigation in Full Content view
   - Use the floating "Back to Table of Contents" button to return to the TOC

3. **Translating Articles**
   - Click "Translate" to choose a target language
   - Use "Translate Section" buttons to translate each section individually

4. **Highlighting for Review**
   - Use "Mark for Review" to highlight important text
   - Click "Show Reviews" to activate highlight mode and focus on marked text

5. **Downloading Articles**
   - Click "Download" to access download options
   - Choose between original language or with translations

6. **Sharing Articles**
   - Use the "Share" button to access social sharing options
   - Copy the direct link to share anywhere

## Support

If you find this application useful, consider supporting the project:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/wikitruth)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page) for providing access to Wikipedia content
- [Flask](https://flask.palletsprojects.com/) web framework
- [Bootstrap](https://getbootstrap.com/) for responsive design
- [Feather Icons](https://feathericons.com/) for clean, minimal icons