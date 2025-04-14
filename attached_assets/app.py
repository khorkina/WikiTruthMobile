import os
import logging
import json
import io
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_file
from werkzeug.middleware.proxy_fix import ProxyFix

from wiki_utils import (
    get_wikipedia_search_results,
    get_article_content,
    get_available_languages,
    get_article_in_language,
    translate_text,
    get_language_name,
    get_native_language_name,
    split_content_into_sections,
    LANGUAGE_DICT
)
from highlight_utils import (
    get_highlights,
    save_highlight,
    load_highlights
)
from doc_utils import (
    create_wiki_document,
    get_download_filename
)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "wikitruth-session-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

@app.route('/')
def home():
    """Home page with search functionality"""
    # Default search language to English if not set
    if 'search_lang' not in session:
        session['search_lang'] = 'en'
    
    return render_template('home.html', 
                          language_dict=LANGUAGE_DICT, 
                          get_language_name=get_language_name,
                          selected_lang=session.get('search_lang', 'en'))

@app.route('/search', methods=['POST'])
def search():
    """Handle search requests"""
    search_query = request.form.get('search_query', '')
    search_lang = request.form.get('search_lang', 'en')
    
    # Store in session
    session['search_lang'] = search_lang
    
    if not search_query:
        return redirect(url_for('home'))
    
    # Get search results
    search_results = get_wikipedia_search_results(search_query, search_lang)
    
    return render_template('search_results.html', 
                          search_results=search_results, 
                          search_query=search_query,
                          search_lang=search_lang,
                          language_dict=LANGUAGE_DICT,
                          get_language_name=get_language_name)

@app.route('/article/<path:title>')
def view_article(title):
    """View a Wikipedia article"""
    lang = request.args.get('lang', session.get('search_lang', 'en'))
    show_translation = request.args.get('show_translation', 'false') == 'true'
    translate_to = request.args.get('translate_to', None)
    
    # Get article content
    article = get_article_content(title, lang)
    
    if not article:
        return render_template('home.html', error="Article not found. Please try another search.")
    
    # Get available languages
    available_languages = get_available_languages(title, lang)
    
    # Get highlights
    article_id = f"{article['title']}_{lang}"
    highlights = get_highlights(article_id)
    
    # Split content into sections for progressive translation
    sections = split_content_into_sections(article['content'])
    
    return render_template('article.html',
                          article=article,
                          lang=lang,
                          available_languages=available_languages,
                          highlights=highlights,
                          show_translation=show_translation,
                          translate_to=translate_to,
                          sections=sections,
                          language_dict=LANGUAGE_DICT,
                          get_language_name=get_language_name,
                          get_native_language_name=get_native_language_name)

@app.route('/change-language', methods=['POST'])
def change_language():
    """Change the article language"""
    title = request.form.get('title')
    lang_code = request.form.get('lang_code')
    lang_title = request.form.get('lang_title')
    
    # Get article in selected language
    article = get_article_in_language(lang_title, lang_code)
    
    if article:
        return redirect(url_for('view_article', title=article['title'], lang=lang_code))
    else:
        return redirect(url_for('home', error="Could not load article in selected language."))

@app.route('/translate-section', methods=['POST'])
def translate_section():
    """Translate a specific section of the article"""
    try:
        section_text = request.form.get('text', '')
        from_lang = request.form.get('from_lang', 'en')
        to_lang = request.form.get('to_lang', 'en')
        
        if not section_text or from_lang == to_lang:
            return jsonify({'translated_text': section_text})
        
        translated_text = translate_text(section_text, to_lang, from_lang)
        return jsonify({'translated_text': translated_text})
    except Exception as e:
        logging.error(f"Translation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/save-highlight', methods=['POST'])
def save_highlight_route():
    """Save a highlight for collaborative review"""
    # Check if the content type is URL-encoded form data
    if request.content_type == 'application/x-www-form-urlencoded':
        # Get data from form
        article_id = request.form.get('article_id')
        text_to_highlight = request.form.get('text_to_highlight')
        context = request.form.get('context')
    else:
        # Get data from JSON or form
        data = request.get_json() if request.is_json else request.form
        article_id = data.get('article_id')
        text_to_highlight = data.get('text_to_highlight')
        context = data.get('context')
    
    # Validate required fields
    if not text_to_highlight or not article_id:
        return jsonify({'success': False, 'error': 'Missing required fields'})
    
    # Save the highlight
    save_highlight(article_id, text_to_highlight, context)
    
    # Return updated highlights
    highlights = get_highlights(article_id)
    return jsonify({'success': True, 'highlights': highlights})

@app.route('/get-highlights/<path:article_id>')
def get_highlights_route(article_id):
    """Get all highlights for an article"""
    highlights = get_highlights(article_id)
    return jsonify({'highlights': highlights})

@app.route('/download-article')
def download_article():
    """Generate and download article as a document"""
    title = request.args.get('title')
    lang = request.args.get('lang', 'en')
    is_translated = request.args.get('is_translated', 'false') == 'true'
    translated_to = request.args.get('translated_to')
    
    # Get article content
    article = get_article_content(title, lang)
    
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    
    # Generate document
    language_name = get_language_name(lang)
    doc_buffer = create_wiki_document(article, language_name, is_translated, 
                                      get_language_name(translated_to) if translated_to else None)
    
    # Generate filename
    filename = get_download_filename(article['title'], is_translated, translated_to)
    
    # Return document for download
    return send_file(
        doc_buffer,
        as_attachment=True,
        download_name=filename,
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

@app.route('/all-highlights')
def view_all_highlights():
    """View all highlights across articles"""
    all_highlights = load_highlights()
    
    # Group by article
    articles = {}
    for article_id, highlights in all_highlights.items():
        if highlights:
            article_parts = article_id.rsplit('_', 1)
            title = article_parts[0]
            lang = article_parts[1] if len(article_parts) > 1 else "unknown"
            
            if title not in articles:
                articles[title] = {
                    'title': title,
                    'languages': {}
                }
            
            articles[title]['languages'][lang] = {
                'highlights': highlights,
                'language_name': get_language_name(lang)
            }
    
    return render_template('highlights.html', 
                          articles=articles, 
                          language_dict=LANGUAGE_DICT,
                          get_language_name=get_language_name)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
