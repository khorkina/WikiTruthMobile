// Main JS file for WikiTruth app

/**
 * Tab switching functionality for article view
 */
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.article-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show the selected tab content
    const selectedContent = document.getElementById(tabName + '-content');
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Add active class to selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

/**
 * Copy share link and show feedback
 */
function copyShareLink() {
    const shareLinkInput = document.getElementById('shareLink');
    if (shareLinkInput) {
        shareLinkInput.select();
        document.execCommand('copy');
        
        // Show success message
        const copyMessage = document.getElementById('copyMessage');
        if (copyMessage) {
            copyMessage.style.display = 'block';
            setTimeout(() => {
                copyMessage.style.display = 'none';
            }, 2000);
        }
        
        // Update button appearance
        const button = shareLinkInput.nextElementSibling;
        if (button) {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i data-feather="check"></i>';
            feather.replace();
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                feather.replace();
            }, 2000);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Add click event for copy button
    const copyButtons = document.querySelectorAll('.btn-copy');
    if (copyButtons) {
        copyButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                if (targetId) {
                    copyToClipboard(document.getElementById(targetId).value);
                    
                    // Change button icon temporarily to show success
                    const originalHTML = this.innerHTML;
                    this.innerHTML = '<i data-feather="check"></i>';
                    feather.replace();
                    
                    setTimeout(() => {
                        this.innerHTML = originalHTML;
                        feather.replace();
                    }, 2000);
                }
            });
        });
    }
    
    // Add click event for highlight toggle buttons
    const highlightToggles = document.querySelectorAll('.toggle-highlight-btn');
    if (highlightToggles) {
        highlightToggles.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                if (targetId) {
                    const target = document.getElementById(targetId);
                    if (target) {
                        if (target.style.display === 'none' || !target.style.display) {
                            target.style.display = 'block';
                        } else {
                            target.style.display = 'none';
                        }
                    }
                }
            });
        });
    }
    
    // Initialize Sharer.js if available
    if (window.Sharer) {
        window.Sharer.init();
    }
    
    // Add click event for translate section buttons
    const translateButtons = document.querySelectorAll('.translate-section-btn');
    if (translateButtons) {
        translateButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                const fromLang = this.getAttribute('data-from');
                const toLang = this.getAttribute('data-to');
                
                if (sectionId && fromLang && toLang) {
                    translateSection(sectionId, fromLang, toLang);
                }
            });
        });
    }
    
    // Add event listener for back to TOC button
    const backToTocButton = document.getElementById('back-to-toc');
    if (backToTocButton) {
        // Initially hide the button
        backToTocButton.style.display = 'none';
        
        // Show the button when scrolled down
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTocButton.style.display = 'flex';
            } else {
                backToTocButton.style.display = 'none';
            }
        });
        
        // Scroll to TOC when clicked
        backToTocButton.addEventListener('click', function() {
            const toc = document.querySelector('.table-of-contents');
            if (toc) {
                toc.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Add event listener for highlights toggle button
    const toggleHighlightsBtn = document.getElementById('toggle-highlights-btn');
    if (toggleHighlightsBtn) {
        toggleHighlightsBtn.addEventListener('click', function() {
            const highlightsBtnText = document.getElementById('highlights-btn-text');
            const articleContainer = document.querySelector('.article-container');
            
            // Toggle highlight mode class
            articleContainer.classList.toggle('highlight-mode');
            
            // Update button text
            if (articleContainer.classList.contains('highlight-mode')) {
                if (highlightsBtnText) {
                    highlightsBtnText.textContent = 'Hide Reviews';
                }
                // Show only highlighted content
                showOnlyHighlights(true);
            } else {
                if (highlightsBtnText) {
                    highlightsBtnText.textContent = 'Show Reviews';
                }
                // Show all content
                showOnlyHighlights(false);
            }
        });
    }
});

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    if (!text) return;
    
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Prevent scrolling to bottom
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        // Execute copy command
        document.execCommand('copy');
        console.log('Text copied to clipboard');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    
    // Clean up
    document.body.removeChild(textarea);
}

/**
 * Apply highlights to text
 */
function applyHighlights(sectionId, highlights) {
    if (!highlights || !highlights.length) return;
    
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Get current HTML content
    let html = section.innerHTML;
    
    // Sort highlights by length (longest first) to handle nested highlights properly
    highlights.sort((a, b) => b.text.length - a.text.length);
    
    // Replace each highlight with a marked version
    highlights.forEach(highlight => {
        const text = highlight.text;
        if (!text) return;
        
        // Simple text replacement (more robust than regex for this purpose)
        const parts = html.split(text);
        if (parts.length > 1) {
            html = parts.join(`<mark>${text}</mark>`);
        }
    });
    
    // Update section HTML
    section.innerHTML = html;
}

/**
 * Save a highlight
 */
function saveHighlight(event, articleId, context) {
    event.preventDefault();
    
    const form = event.target;
    const textareaId = 'highlight-text-' + context.replace('section-', '');
    const textarea = document.getElementById(textareaId);
    const textToHighlight = textarea.value.trim();
    
    if (!textToHighlight) {
        alert('Please enter text to highlight');
        return;
    }
    
    // Submit highlight via AJAX
    fetch('/save-highlight', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'article_id': articleId,
            'text_to_highlight': textToHighlight,
            'context': context
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear the textarea
            textarea.value = '';
            
            // Hide the form
            const formContainer = form.closest('.highlight-form');
            formContainer.style.display = 'none';
            
            // Show success message
            alert('Text marked for review!');
            
            // Don't reload but show highlights instantly
            showOnlyHighlights(true);
        } else {
            alert('Error: ' + (data.error || 'Could not save highlight'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving highlight');
    });
}

/**
 * Progressive section-by-section translation
 */
function translateSection(sectionId, fromLang, toLang) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Get the text to translate
    const textToTranslate = section.innerText || section.textContent;
    if (!textToTranslate.trim()) return;
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'translation-loading';
    loadingIndicator.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div> Translating...';
    section.parentNode.insertBefore(loadingIndicator, section.nextSibling);
    
    // Create form data
    const formData = new FormData();
    formData.append('text', textToTranslate);
    formData.append('from_lang', fromLang);
    formData.append('to_lang', toLang);
    
    // Make fetch request
    fetch('/translate-section', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        if (data.translated_text) {
            // Create translation container
            const translationContainer = document.createElement('div');
            translationContainer.className = 'translated-content';
            translationContainer.innerHTML = `
                <div class="translation-header">
                    <span class="translation-label">Translated to ${toLang}</span>
                </div>
                <div class="translation-text">${data.translated_text}</div>
            `;
            
            // Remove any existing translation
            const existingTranslation = section.nextElementSibling;
            if (existingTranslation && existingTranslation.classList.contains('translated-content')) {
                existingTranslation.remove();
            }
            
            // Add new translation
            section.parentNode.insertBefore(translationContainer, section.nextSibling);
        } else if (data.error) {
            alert('Translation error: ' + data.error);
        }
    })
    .catch(error => {
        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        console.error('Error translating section:', error);
        alert('Error translating section. Please try again.');
    });
}

/**
 * Show only highlighted content
 */
function showOnlyHighlights(showOnly) {
    // Get all sections with highlights
    const sections = document.querySelectorAll('.content-section');
    
    if (showOnly) {
        // Create highlights container if it doesn't exist
        let highlightsContainer = document.querySelector('.highlights-only');
        if (!highlightsContainer) {
            highlightsContainer = document.createElement('div');
            highlightsContainer.className = 'highlights-only';
            
            // Create heading
            const heading = document.createElement('h3');
            heading.className = 'section-title';
            heading.textContent = 'Marked Reviews';
            
            // Add to container
            highlightsContainer.appendChild(heading);
            
            // Add to page
            const articleContent = document.querySelector('.article-content-container');
            if (articleContent) {
                articleContent.prepend(highlightsContainer);
            }
        }
        
        // Load highlights data from server for this article
        const articleId = document.querySelector('meta[name="article-id"]')?.content;
        
        if (articleId) {
            fetch(`/save-highlight`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'article_id': articleId,
                    'text_to_highlight': '',  // Empty to just retrieve current highlights
                    'context': 'retrieve_only'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.highlights && data.highlights.length > 0) {
                    // Clear previous highlights container content
                    highlightsContainer.innerHTML = '';
                    
                    // Create heading
                    const heading = document.createElement('h3');
                    heading.className = 'section-title';
                    heading.textContent = 'Marked Reviews';
                    highlightsContainer.appendChild(heading);
                    
                    // Process each highlight
                    data.highlights.forEach(highlight => {
                        // Create highlight item
                        const highlightItem = document.createElement('div');
                        highlightItem.className = 'highlight-item';
                        
                        // Create context info
                        const context = document.createElement('div');
                        context.className = 'highlight-context';
                        context.textContent = highlight.context || 'General';
                        
                        // Create highlight text
                        const text = document.createElement('div');
                        text.className = 'highlight-text';
                        text.innerHTML = `<mark>${highlight.text}</mark>`;
                        
                        // Add to highlight item
                        highlightItem.appendChild(context);
                        highlightItem.appendChild(text);
                        
                        // Add to container
                        highlightsContainer.appendChild(highlightItem);
                    });
                    
                    // Show highlighted container
                    highlightsContainer.style.display = 'block';
                } else {
                    // No highlights found
                    highlightsContainer.innerHTML = `
                        <h3 class="section-title">Marked Reviews</h3>
                        <p>No text has been marked for review in this article.</p>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching highlights:', error);
                highlightsContainer.innerHTML = `
                    <h3 class="section-title">Marked Reviews</h3>
                    <p>Error loading review highlights. Please try again later.</p>
                `;
            });
        } else {
            highlightsContainer.innerHTML = `
                <h3 class="section-title">Marked Reviews</h3>
                <p>No article information found.</p>
            `;
        }
    } else {
        // Hide highlights container
        const highlightsContainer = document.querySelector('.highlights-only');
        if (highlightsContainer) {
            highlightsContainer.style.display = 'none';
        }
    }
}
